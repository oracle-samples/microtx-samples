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

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.lra.annotation.AfterLRA;
import org.eclipse.microprofile.lra.annotation.LRAStatus;
import org.eclipse.microprofile.lra.annotation.ws.rs.LRA;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.logging.Logger;

import static javax.ws.rs.core.Response.Status.INTERNAL_SERVER_ERROR;
import static javax.ws.rs.core.Response.Status.OK;

@Path("/cinemaBookingApp/api")
@ApplicationScoped
public class BookingResource {

    private static final Logger LOG = Logger.getLogger(BookingResource.class.getSimpleName());
    private URI seatBookingResUri;
    private URI paymentResUri;
    private static Double bookingAmount = 10.0;

    @Inject
    @ConfigProperty(name = "seatbooking.service.url")
    private String seatBookingRes;

    @Inject
    @ConfigProperty(name = "payment.service.url")
    private String paymentRes;

    @Inject
    @ConfigProperty(name = "mp.lra.coordinator.url")
    private String coordinatorRes;

    @PostConstruct
    private void initController() {
        try {
            seatBookingResUri = new URI(seatBookingRes);
            paymentResUri = new URI(paymentRes);
        } catch (URISyntaxException ex) {
            throw new IllegalStateException("Failed to initialize " + BookingResource.class.getName(), ex);
        }
    }

    @POST
    @Path("/book")
    // Create new LRA transaction which will end after this JAX-RS method end
    // Time limit for new LRA is 180 sec
    @LRA(value = LRA.Type.REQUIRES_NEW, end = true, timeLimit = 180)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createBooking(@HeaderParam(LRA.LRA_HTTP_CONTEXT_HEADER) String lraId,
                                  BookingRequest request) {
        if (lraId == null) {
            return Response.serverError().entity("Failed to initialize LRA transaction").build();
        }
        LOG.info("Started new LRA : " + lraId);

        try {
            // reserve seat
            BookingResponse response = reserveSeat(request);
            Response paymentRes = takePayment(request);

            //return Response.status(Response.Status.OK.getStatusCode(), "Successfully booked the seat with Booking id " + response.getId() + ". Reserved seat " + response.getSeatId()).build();
            return Response.ok().build();

        } catch (Exception ex) {
            ex.printStackTrace();
            return Response.status(INTERNAL_SERVER_ERROR.getStatusCode(), ex.getLocalizedMessage()).build();
        }
    }

    @PUT
    @Path("/after")
    @AfterLRA
    @Consumes(MediaType.TEXT_PLAIN)
    public Response afterLRA(@HeaderParam(LRA.LRA_HTTP_ENDED_CONTEXT_HEADER) URI lraId, LRAStatus status) throws NotFoundException {
        LOG.info("After LRA Called : " + lraId);
        LOG.info("Final LRA Status : " + status);
        return Response.ok().build();
    }

    private BookingResponse reserveSeat(BookingRequest request) throws Exception {
        LOG.info("Calling Seat booking service to reserve seat");
        WebTarget webTarget = getSeatBookingSvcTarget().path("/");
        Response response = webTarget.request().post(Entity.json(request));

        if (response.getStatus() == OK.getStatusCode()) {
            BookingResponse bookingResponse = response.readEntity(BookingResponse.class);
            LOG.info("Successfully reserved the seat");
            return bookingResponse;
        } else {
            LOG.info("Failed to reserve the seat");
            throw new Exception("Seat reservation failed.");
        }
    }

    private Response takePayment(BookingRequest request) throws Exception {
        LOG.info("Calling payment service to make payment");
        WebTarget webTarget = getPaymentSvcTarget().path("/");
        PaymentRequest paymentRequest = new PaymentRequest(request.getAccountNumber(), bookingAmount);
        Response response = webTarget.request().post(Entity.json(paymentRequest));

        if (response.getStatus() == OK.getStatusCode()) {
            LOG.info("Payment successful");
            return response;
        } else {
            LOG.info("Payment failed");
            throw new Exception("Payment failed.");
        }
    }

    private WebTarget getSeatBookingSvcTarget() {
        return ClientBuilder.newClient().target(seatBookingResUri);
    }

    private WebTarget getPaymentSvcTarget() {
        return ClientBuilder.newClient().target(paymentResUri);
    }
}
