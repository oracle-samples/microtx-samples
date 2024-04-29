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
package com.oracle.tmm.example.lra;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.eclipse.microprofile.lra.annotation.Compensate;
import org.eclipse.microprofile.lra.annotation.Complete;
import org.eclipse.microprofile.lra.annotation.ParticipantStatus;
import org.eclipse.microprofile.lra.annotation.ws.rs.LRA;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.json.Json;
import javax.json.JsonBuilderFactory;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Collections;
import java.util.List;
import java.util.logging.Logger;

@Path("/seatBookingService/api")
@ApplicationScoped
public class SeatBookingResource {

    private static final Logger LOG = Logger.getLogger(SeatBookingResource.class.getSimpleName());
    private static final JsonBuilderFactory JSON = Json.createBuilderFactory(Collections.emptyMap());
    private ObjectMapper mapper = new ObjectMapper();

    @Inject
    SeatBookingService repository;

    @POST
    @Path("/reserve")
    @LRA(value = LRA.Type.MANDATORY, end = false)
    @Produces(MediaType.APPLICATION_JSON)
    public Response reserveSeat(@HeaderParam(LRA.LRA_HTTP_CONTEXT_HEADER) String lraId,
                                  BookingRequest request) {

        try {
            LOG.info("Creating booking for seat:" + request.getSeatId());
            Booking booking = repository.createBooking(request, lraId);
            LOG.info("Creating booking for seat:" + request.getSeatId() + ". Booking Id:" + booking.getId());
            return Response.ok().build();
        } catch (Exception ex) {
            LOG.info("Failed to create the booking for seat:" + request.getSeatId());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(JSON.createObjectBuilder()
                            .add("error", ex.getMessage())
                            .build())
                    .build();
        }
    }

    @PUT
    @Path("/compensate")
    @Produces(MediaType.TEXT_PLAIN)
    @Compensate
    public Response cancelReservedBooking(@HeaderParam(LRA.LRA_HTTP_CONTEXT_HEADER) String lraId) {
        LOG.info("Cancel reserved booking is called for LRA: " + lraId);
        repository.clearBooking(lraId)
                .ifPresent(booking -> {
                    LOG.info("Booking for seat " + booking.getSeatId() + " cleared!");
                });

        return Response.ok(ParticipantStatus.Completed.name()).build();
    }

    @PUT
    @Path("/complete")
    @Produces(MediaType.TEXT_PLAIN)
    @Complete
    public Response paymentSuccessful(@HeaderParam(LRA.LRA_HTTP_CONTEXT_HEADER) String lraId) {
        LOG.info("Confirm reserved booking is called for LRA: " + lraId);
        repository.confirmBooking(lraId);
        return Response.ok(ParticipantStatus.Completed.name()).build();
    }

    @GET
    @Path("/seats/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getSeat(@PathParam("id") String id) {
        try {
            Seat seat = repository.getSeatById(id);
            return Response.ok(seat).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NO_CONTENT).build();
        }
    }

    @GET
    @Path("/seats")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllSeats() {
        LOG.info("Getting all seats.");
        List<Seat> seats = repository.getAllSeats();
        try {
            return Response.ok(mapper.writeValueAsString(seats)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NO_CONTENT).build();
        }
    }
}
