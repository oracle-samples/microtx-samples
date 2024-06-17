/*
Copyright (c) 2023, Oracle and/or its affiliates. **

The Universal Permissive License (UPL), Version 1.0 **

Subject to the condition set forth below, permission is hereby granted to any person obtaining a copy of this software, associated documentation and/or data
(collectively the "Software"), free of charge and under any and all copyright rights in the Software, and any and all patent rights owned or freely licensable by each
licensor hereunder covering either the unmodified Software as contributed to or provided by such licensor, or (ii) the Larger Works (as defined below), to deal in both **
(a) the Software, and (b) any piece of software and/or hardware listed in the lrgrwrks.txt file if one is included with the Software (each a "Larger Work" to which the
Software is contributed by such licensors), **
without restriction, including without limitation the rights to copy, create derivative works of, display, perform, and distribute the Software and make, use, sell,
offer for sale, import, export, have made, and have sold the Software and the Larger Work(s), and to sublicense the foregoing rights on either these or other terms. **

This license is subject to the following condition: The above copyright notice and either this complete permission notice or at a minimum a reference to the UPL must be
included in all copies or substantial portions of the Software. **

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
package com.oracle.trm.lra.demo.tripservice;


import com.oracle.trm.lra.demo.model.Booking;
import io.helidon.lra.coordinator.client.PropagatedHeaders;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.lra.annotation.AfterLRA;
import org.eclipse.microprofile.lra.annotation.LRAStatus;
import org.eclipse.microprofile.lra.annotation.ws.rs.LRA;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.logging.Logger;

import static javax.ws.rs.core.Response.Status.INTERNAL_SERVER_ERROR;
import static org.eclipse.microprofile.lra.annotation.ws.rs.LRA.LRA_HTTP_CONTEXT_HEADER;
import static org.eclipse.microprofile.lra.annotation.ws.rs.LRA.LRA_HTTP_ENDED_CONTEXT_HEADER;

@ApplicationScoped
@Path("/trip-service/api")
public class TripManagerResource {

    private static final String ORACLE_TMM_TX_TOKEN = "Oracle-Tmm-Tx-Token";
    private static final Logger log = Logger.getLogger(TripManagerResource.class.getSimpleName());
    private URI hotelResUri;
    private URI flightResUri;

    @Inject
    private TripService service;

    @Inject
    @ConfigProperty(name = "hotel.service.url")
    private String hotelRes;

    @Inject
    @ConfigProperty(name = "flight.service.url")
    private String flightRes;

    @Inject
    @ConfigProperty(name = "mp.lra.coordinator.url")
    private String coordinatorRes;


    /**
     * Initialise the hotel and flight service endpoints
     */
    @PostConstruct
    private void initController() {
        try {
            hotelResUri = new URI(hotelRes);
            flightResUri = new URI(flightRes);
        } catch (URISyntaxException ex) {
            throw new IllegalStateException("Failed to initialize " + TripManagerResource.class.getName(), ex);
        }
    }

    @POST
    @Path("/trip")
    @Produces(MediaType.APPLICATION_JSON)
    @LRA(value = LRA.Type.REQUIRES_NEW, end = false)
    //end is false so that the LRA remains active after the method is finished execution. LRA will be closed or compensated only after the booking is confirmed or cancelled
    public Response bookTrip(@QueryParam("hotelName") @DefaultValue("TheGrand") String hotelName, @QueryParam("flightNumber") @DefaultValue("A123") String flightNumber, @Context UriInfo uriInfo, @HeaderParam(LRA_HTTP_CONTEXT_HEADER) String lraId, @Context ContainerRequestContext containerRequestContext) throws BookingException, UnsupportedEncodingException, UnknownHostException {
        if (lraId == null) {
            return Response.serverError().entity("Failed to create LRA").build();
        }
        log.info("Started new LRA : " + lraId);

        Booking tripBooking = null;
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));
        try {
            Booking flightBooking = null;
            Booking hotelBooking = bookHotel(hotelName, bookingId);
            // Book the flight only when hotel booking did not fail
            if (hotelBooking.getStatus() != Booking.BookingStatus.FAILED) {
                flightBooking = bookFlight(flightNumber, bookingId);
            }
            // Create trip booking that contains the hotel and flight bookings
            tripBooking = new Booking(bookingId, "Trip", "Trip", hotelBooking, flightBooking);
            service.saveProvisionalBooking(tripBooking);
            return Response.ok(tripBooking).header(ORACLE_TMM_TX_TOKEN, getOracleTmmTxToken(containerRequestContext)).build();
        } catch (BookingException ex) {
            return Response.status(INTERNAL_SERVER_ERROR.getStatusCode(), ex.getLocalizedMessage()).entity(tripBooking).build();
        }
    }

    @GET
    @Path("/trip/{bookingId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getBooking(@PathParam("bookingId") String bookingId) {
        return Response.ok(service.get(bookingId)).build();
    }

    @PUT
    @Path("/trip/{bookingId}")
    @Produces(MediaType.APPLICATION_JSON)
    @LRA(value = LRA.Type.MANDATORY, end = true)
    public Response confirmTrip(@PathParam("bookingId") String bookingId) throws NotFoundException {
        log.info("Received Confirmation for trip booking with Id : " + bookingId);
        Booking tripBooking = service.get(bookingId);
        if (tripBooking.getStatus() == Booking.BookingStatus.CANCEL_REQUESTED)
            throw new WebApplicationException(Response.status(Response.Status.BAD_REQUEST).entity("Cannot confirm a trip booking that needs to be cancelled").build());
        return Response.ok().build();
    }

    @DELETE
    @Path("/trip/{bookingId}")
    @Produces(MediaType.APPLICATION_JSON)
    @LRA(value = LRA.Type.MANDATORY, end = true, cancelOn = Response.Status.OK)
    public Response cancelTrip(@PathParam("bookingId") String bookingId) throws NotFoundException {
        log.info("Received Cancellation for trip booking with Id : " + bookingId);
        return Response.ok("Cancel booking requested").build();
    }

    @GET
    @Path("/trip")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAll() {
        return Response.ok(service.getAll()).build();
    }

    @PUT
    @Path("/after")
    @AfterLRA
    @Consumes(MediaType.TEXT_PLAIN)
    public Response afterLRA(@HeaderParam(LRA_HTTP_ENDED_CONTEXT_HEADER) String lraId, LRAStatus status) throws NotFoundException {
        log.info("After LRA Called : " + lraId);
        log.info("Final LRA Status : " + status);
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));
        Booking tripBooking = service.get(bookingId);
        if (tripBooking != null) {
            // Fetch the final status of hotel and flight booking
            service.mergeAssociateBookingDetails(tripBooking, getHotelTarget(), getFlightTarget());
        }
        // Clean up of resources held by this LRA
        return Response.ok().build();
    }


    /**
     * Calls the hotel service to book a room at the given hotel
     *
     * @param name Name of the hotel to be booked
     * @param id   Identity of the booking
     * @return hotel booking details
     */

    private Booking bookHotel(String name, String id) {
        log.info("Calling Hotel Service to book hotel with booking Id : " + id);
        WebTarget webTarget = getHotelTarget().queryParam("hotelName", name);
        Booking hotelBooking = webTarget.request().post(Entity.text("")).readEntity(Booking.class);
        log.info(String.format("Hotel booking %s with booking Id : %s", (hotelBooking.getStatus() == Booking.BookingStatus.FAILED ? "FAILED" : "SUCCESSFUL"), hotelBooking.getId()));
        return hotelBooking;
    }

    /**
     * Calls the flight service to book a seat at the given flight
     *
     * @param flightNumber Name of the flight to be booked
     * @param id           Identity of the booking
     * @return flight booking details
     */
    private Booking bookFlight(String flightNumber, String id) {
        log.info("Calling Flight Service to book flight with booking Id : " + id);
        WebTarget webTarget = getFlightTarget().queryParam("flightNumber", flightNumber);
        Booking flightBooking = webTarget.request().post(Entity.text("")).readEntity(Booking.class);
        log.info(String.format("Flight booking %s with booking Id : %s", (flightBooking.getStatus() == Booking.BookingStatus.FAILED ? "FAILED" : "SUCCESSFUL"), flightBooking.getId()));
        return flightBooking;
    }

    private WebTarget getHotelTarget() {
        return ClientBuilder.newClient().target(hotelResUri);
    }

    private WebTarget getFlightTarget() {
        return ClientBuilder.newClient().target(flightResUri);
    }

    private String getOracleTmmTxToken(ContainerRequestContext reqContext) {
        PropagatedHeaders propagatedHeaders = (PropagatedHeaders) reqContext.getProperty(PropagatedHeaders.class.getName());
        List<String> headerValue = propagatedHeaders.toMap().getOrDefault(ORACLE_TMM_TX_TOKEN, null);
        if(headerValue==null){
            headerValue = propagatedHeaders.toMap().getOrDefault(ORACLE_TMM_TX_TOKEN.toLowerCase(), null);
        }
        return headerValue != null && headerValue.size() > 0 ? headerValue.get(0) : null;
    }
}