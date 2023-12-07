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
package com.example.flight.booking;

import oracle.tmm.tcc.TccClient;
import oracle.tmm.tcc.annotation.TCC;
import oracle.tmm.tcc.exception.TccUnknownTransactionException;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Application;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;


@Path("api/")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@TCC(timeLimit = 120, timeUnit = ChronoUnit.SECONDS)
public class FlightBookingAppResource extends Application {

    @Inject
    @ConfigProperty(name = "booking.base.url")
    private String bookingBaseUrl;

    int currBookingID = 0;
    int totalBookingsAllowed = 30;
    Map<String, Booking> bookings = new HashMap<>();

    private static final Logger log = Logger.getLogger(FlightBookingAppResource.class.getSimpleName());

    @POST
    @Path("bookings")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response create(@QueryParam("flightNumber") @DefaultValue("Flight-01") String flightNumber) throws TccUnknownTransactionException {
        log.info("Received Create request");
        if (!checkSeatAvailable()) {
            return Response.serverError().entity("Maximum bookings reached").build();
        }
        UUID flightBookingId = UUID.randomUUID();
        StringBuilder bookingUri = new StringBuilder().append(bookingBaseUrl).append("/").append(flightBookingId.toString());
        currBookingID++;
        Booking booking = new Booking(bookingUri.toString(), System.currentTimeMillis(), TccClient.getTimeLimit(),flightBookingId.toString());
        booking.setBookingMetadata("FLIGHT", flightNumber);
        bookings.put(flightBookingId.toString(), booking);
        // Register participant with the TCC transaction
        try {
            // call back define , then pass that URL :
            TccClient.addTccParticipant(bookingUri.toString());
        } catch (TccUnknownTransactionException e) {
            log.severe("Flight booking failed :" + e.getLocalizedMessage());
            e.printStackTrace();
        }
        log.info("Booking created:" + booking);
        return Response.ok(booking).build();
    }

    @PUT
    @Path("bookings/{bookingId}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response confirm(@PathParam("bookingId") String bookingId) {
        log.info("In Confirm booking. Booking ID is [ " + bookingId + " ]");
        Booking booking = bookings.get(bookingId);
        if (booking == null) {
            log.info(String.format("Booking ID [ %s ] not found", bookingId));
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (checkIfExpired(booking)) {
            bookings.remove(bookingId);
            log.info("In Confirm booking. Request expired for booking ID is [ " + bookingId + " ]");
            return Response.serverError().entity("Booking expired" + booking).build();
        }
        bookings.remove(bookingId);
        log.info(String.format("Booking ID [ %s ] confirmed", bookingId));
        return Response.ok().build();
    }

    @DELETE
    @Path("bookings/{bookingId}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response cancel(@PathParam("bookingId") String bookingId) {
        log.info("In Cancel booking. Booking ID is [ " + bookingId + " ]");
        Booking booking = bookings.get(bookingId);
        if (booking == null) {
            log.info(String.format("Booking ID [ %s ] not found", bookingId));
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        bookings.remove(bookingId);
        log.info(String.format("Booking ID [ %s ] is cancelled", bookingId));
        return Response.ok().build();
    }

    private boolean checkSeatAvailable() {
        return currBookingID < totalBookingsAllowed;
    }

    private boolean checkIfExpired(Booking booking) {
        return (System.currentTimeMillis() - booking.startTime) > booking.expires;
    }
}
