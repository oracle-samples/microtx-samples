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
package com.oracle.trm.lra.demo.hotel;

import com.oracle.trm.lra.demo.model.Booking;
import org.eclipse.microprofile.lra.annotation.AfterLRA;
import org.eclipse.microprofile.lra.annotation.Compensate;
import org.eclipse.microprofile.lra.annotation.Complete;
import org.eclipse.microprofile.lra.annotation.ParticipantStatus;
import org.eclipse.microprofile.lra.annotation.Status;
import org.eclipse.microprofile.lra.annotation.ws.rs.LRA;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
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
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.logging.Logger;

import static org.eclipse.microprofile.lra.annotation.ws.rs.LRA.LRA_HTTP_CONTEXT_HEADER;
import static org.eclipse.microprofile.lra.annotation.ws.rs.LRA.LRA_HTTP_ENDED_CONTEXT_HEADER;
import static org.eclipse.microprofile.lra.annotation.ws.rs.LRA.LRA_HTTP_PARENT_CONTEXT_HEADER;


@Path("/hotelService/api")
@ApplicationScoped
public class HotelResource {

    private static final Logger log = Logger.getLogger(HotelResource.class.getSimpleName());

    @Inject
    private HotelService hotelService;

    @POST
    @Path("/hotel")
    @Produces(MediaType.APPLICATION_JSON)
    @LRA(value = LRA.Type.MANDATORY, end = false)
    public Response bookRoom(@HeaderParam(LRA_HTTP_CONTEXT_HEADER) String lraId, @QueryParam("hotelName") @DefaultValue("Default") String hotelName) {
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));
        Booking booking = hotelService.book(bookingId, hotelName);
        log.info("Hotel Booking created: " + booking);
        return Response.ok(booking).build();
    }

    @PUT
    @Path("/complete")
    @Produces(MediaType.TEXT_PLAIN)
    @Complete
    public Response completeWork(@HeaderParam(LRA_HTTP_CONTEXT_HEADER) String lraId) throws NotFoundException {
        log.info("HotelServiceResource complete() called for LRA : " + lraId);
        // Business logic to complete the work related to this LRA
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));
        Booking booking = hotelService.get(bookingId);
        if(booking == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Hotel booking not found").build();
        }
        if (booking.getStatus() == Booking.BookingStatus.PROVISIONAL) {
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
            return Response.ok(ParticipantStatus.Completed.name()).build();
        }
        booking.setStatus(Booking.BookingStatus.FAILED);
        return Response.ok(ParticipantStatus.FailedToComplete.name()).build();
    }

    @PUT
    @Path("/compensate")
    @Produces(MediaType.TEXT_PLAIN)
    @Compensate
    public Response compensateWork(@HeaderParam(LRA_HTTP_CONTEXT_HEADER) String lraId) throws NotFoundException {
        log.info("HotelServiceResource compensate() called for LRA : " + lraId);
        // Business logic to compensate the work related to this LRA
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));
        Booking booking = hotelService.get(bookingId);
        if(booking == null){
            return Response.status(Response.Status.NOT_FOUND).entity("Hotel booking not found").build();
        }
        if (booking.getStatus() == Booking.BookingStatus.PROVISIONAL) {
            booking.setStatus(Booking.BookingStatus.CANCELLED);
            return Response.ok(ParticipantStatus.Compensated.name()).build();
        }
        booking.setStatus(Booking.BookingStatus.FAILED);
        return Response.ok(ParticipantStatus.FailedToCompensate.name()).build();
    }

    @GET
    @Path("/status")
    @Produces(MediaType.TEXT_PLAIN)
    @Status
    public Response status(@HeaderParam(LRA_HTTP_CONTEXT_HEADER) String lraId, @HeaderParam(LRA_HTTP_PARENT_CONTEXT_HEADER) String parentLRA) {
        log.info("HotelServiceResource status() called for LRA : " + lraId);
        if (parentLRA != null) { // is the context nested
            // code which is sensitive to executing with a nested context goes here
        }
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));
        Booking.BookingStatus status = hotelService.get(bookingId).getStatus();
        // Business logic (provided by the business developer)
        if(status == Booking.BookingStatus.CONFIRMED) {
            return Response.ok(ParticipantStatus.Completed).build();
        }
        return Response.ok(ParticipantStatus.Compensated).build();
    }

    @PUT
    @Path("/after")
    @AfterLRA
    @Consumes(MediaType.TEXT_PLAIN)
    public Response afterLRA(@HeaderParam(LRA_HTTP_ENDED_CONTEXT_HEADER) String lraId, String status) throws NotFoundException {
        log.info("After LRA Called : " + lraId);
        log.info("Final LRA Status : " + status);
        // Clean up of resources held by this LRA
        return Response.ok().build();
    }

    @GET
    @Path("/hotel/{bookingId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getBooking(@PathParam("bookingId") String bookingId) {
        log.info("Get Hotel Booking : " + bookingId);
        return Response.ok(hotelService.get(bookingId)).build();
    }

    @GET
    @Path("/hotel")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAll() {
        log.info("Get All Hotel bookings");
        return Response.ok(hotelService.getAll()).build();
    }

    @PUT
    @Path("/maxbookings")
    @Produces(MediaType.TEXT_PLAIN)
    public Response setMaxBookingCount(@QueryParam("count") @DefaultValue("3") Integer maxBookingCount) {
        HotelService.MAX_BOOKING = maxBookingCount;
        log.info("Set Max Hotel Booking Count: " + maxBookingCount);
        return Response.ok(maxBookingCount).build();
    }

}
