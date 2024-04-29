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
package io.helidon.examples.quickstart.mp;


import oracle.tmm.tcc.TccClientService;
import oracle.tmm.tcc.TccParticipantStatus;
import oracle.tmm.tcc.annotation.TCC;
import oracle.tmm.tcc.exception.TccException;
import oracle.tmm.tcc.exception.TccHeuristicException;
import oracle.tmm.tcc.exception.TccUnknownTransactionException;
import oracle.tmm.tcc.vo.CancelResponse;
import oracle.tmm.tcc.vo.ConfirmResponse;
import oracle.tmm.tcc.vo.TccParticipant;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.*;
import java.util.logging.Logger;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/travel-agent/api/")
@RequestScoped
@TCC
public class BookingResource {

    @Inject
    @ConfigProperty(name = "hotel.booking.app.url")
    private String hotelBookingAppUrl;

    @Inject
    @ConfigProperty(name = "flight.booking.app.url")
    private String flightBookingAppUrl;

    @Inject
    private BookingHistory service;

    @Inject
    TccClientService tccClientService;

    private static final Logger log = Logger.getLogger(BookingResource.class.getSimpleName());

    @GET
    @Path("bookings")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getBooking() {
        return Response.status(Response.Status.OK).entity(service.getAll()).build();
    }

    @GET
    @Path("/bookings/{tripBookingId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getBooking(@PathParam("tripBookingId") String tripBookingId) {
        return Response.ok(service.get(tripBookingId)).build();
    }

    @POST
    @Path("bookings")
    @Produces(MediaType.APPLICATION_JSON)
    public Response booking(@QueryParam("cancel") boolean cancel, @QueryParam("hotelName") @DefaultValue("Hotel-01") String hotelName, @QueryParam("flightNumber") @DefaultValue("Flight-01") String flightNumber) {
        try {
            Vector<Booking> ParticipantBookings = createBookings(hotelName, flightNumber);
            log.info("MicroTx TCC Transaction Id : "+tccClientService.getTransactionId());
            // Confirm tcc transaction
            if (cancel) {
                CancelResponse cancelResponse = tccClientService.cancel();
                log.info("Cancel response" + cancelResponse);
                return Response.status(Response.Status.OK).entity(service.saveBooking(ParticipantBookings, BookingStatus.CANCELLED.name(), "Trip Booking has been cancelled")).build();
            }
            ConfirmResponse confirmResponse = tccClientService.confirm();
            log.info("Confirm response " + confirmResponse.toString());
            return Response.status(Response.Status.OK).entity(service.saveBooking(ParticipantBookings, BookingStatus.CONFIRMED.name(), "Successfully booked the trip")).build();
        } catch (InternalServerErrorException e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
        } catch (TccException e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
        } catch (TccUnknownTransactionException e) {
            e.printStackTrace();
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        } catch (TccHeuristicException e) {
            e.printStackTrace();
            return Response.status(Response.Status.CONFLICT).entity(e.getMessage()).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.CONFLICT).entity(e.getMessage()).build();
        }
    }

    /**
     * API reserves the resources of participants
     *
     * @param hotelName
     * @param flightNumber
     * @return Trip booking response as response body
     *         Response Headers: [link] : Associated Participants callback URI's and TCC Transaction URI
     */
    @POST
    @Path("bookings/reserve")
    @Produces(MediaType.APPLICATION_JSON)
    public Response reservation(@QueryParam("hotelName") @DefaultValue("Hotel-01") String hotelName, @QueryParam("flightNumber") @DefaultValue("Flight-01") String flightNumber) {
        try {
            Vector<Booking> participantBookings = createBookings(hotelName, flightNumber);
            log.info("MicroTx TCC Transaction Id : "+tccClientService.getTransactionId());
            return Response.status(Response.Status.OK)
                    .entity(service.saveBooking(participantBookings,BookingStatus.RESERVED.name(), "Trip Reservation was successful"))
                    .build();
        } catch (InternalServerErrorException e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.CONFLICT)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    /**
     * API confirms the reservations of participants
     *
     * @param tripBookingId : Trip booking Id which is in RESERVED State
     * @return Trip booking response as response body
     *         Response Headers: [link] : Associated Participants callback URI's and TCC Transaction URI
     * API Request Headers: [link] : TCC Transaction URI to join the RESERVED TCC transaction
     */
    @PUT
    @Path("confirm/{tripBookingId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response confirm(@PathParam("tripBookingId") String tripBookingId) {
        try {
            BookingHistory.TransactionHistory transactionHistory = service.get(tripBookingId);
            List<TccParticipant> participants = getTravelParticipants(transactionHistory);
            ConfirmResponse confirmResponse = tccClientService.confirm(participants);
            log.info("MicroTx TCC Transaction Id : "+tccClientService.getTransactionId());
            log.info("Confirm response : " + confirmResponse.toString());
            if (hasAllParticipantsConfirmed(confirmResponse)) {
                return Response.status(Response.Status.OK)
                        .entity(service.updateBookingStatus(tripBookingId, BookingStatus.CONFIRMED.name(),"Booking confirmed Successfully"))
                        .build();
            } else {
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                        .entity(service.updateBookingStatus(tripBookingId, BookingStatus.FAILED.name(), "Booking confirmation Failed"))
                        .build();
            }
        }catch(TccException e){
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Failed to confirm booking "+e.getMessage()))
                    .build();
        } catch (InternalServerErrorException e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.CONFLICT)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    /**
     * API cancels the reservations of participants
     *
     * @param tripBookingId : Trip booking Id which is in RESERVED State
     * @return Trip booking response as response body
     *         Response Headers: [link] : Associated Participants callback URI's and TCC Transaction URI
     * API Request Headers: [link] : TCC Transaction URI to join the RESERVED TCC transaction
     */
    @DELETE
    @Path("cancel/{tripBookingId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response cancel(@PathParam("tripBookingId") String tripBookingId) {
        try {
            BookingHistory.TransactionHistory transactionHistory = service.get(tripBookingId);
            List<TccParticipant> participants = getTravelParticipants(transactionHistory);
            CancelResponse cancelResponse = tccClientService.cancel(participants);
            log.info("MicroTx TCC Transaction Id : "+tccClientService.getTransactionId());
            log.info("Cancel response : " + cancelResponse.toString());
            if (hasAllParticipantsCancelled(cancelResponse)) {
                return Response.status(Response.Status.OK)
                        .entity(service.updateBookingStatus(tripBookingId, BookingStatus.CANCELLED.name(),"Booking cancelled Successfully"))
                        .build();
            } else {
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                        .entity(service.updateBookingStatus(tripBookingId, BookingStatus.FAILED.name(), "Cancellation of booking failed"))
                        .build();
            }
        } catch(TccException e){
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Failed to cancel booking "+e.getMessage()))
                    .build();
        }catch (InternalServerErrorException e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.CONFLICT)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    private boolean hasAllParticipantsConfirmed(ConfirmResponse confirmResponse) {
        return confirmResponse.getParticipants().stream()
                .filter(participantBookingResponse -> !participantBookingResponse.getStatus().equals(TccParticipantStatus.Confirmed.getValue()))
                .findFirst().isPresent();
    }

    private boolean hasAllParticipantsCancelled(CancelResponse cancelResponse) {
        return cancelResponse.getParticipants().stream()
                .filter(participantBookingResponse -> !participantBookingResponse.getStatus().equals(TccParticipantStatus.Cancelled.getValue()))
                .findFirst().isPresent();
    }

    /**
     * @param transactionHistory - Has the booking Ids of Hotel and flight booking
     * @return List<TccParticipant> - TccParticipant composed of participant URL which are participating in the booking
     */
    private List<TccParticipant> getTravelParticipants(BookingHistory.TransactionHistory transactionHistory) {
        List<TccParticipant> participants = new ArrayList<>();
        participants.add(new TccParticipant(transactionHistory.getHotelBooking().getBookingUri(), transactionHistory.getHotelBooking().getExpires()));
        participants.add(new TccParticipant(transactionHistory.getFlightBooking().getBookingUri(), transactionHistory.getHotelBooking().getExpires()));
        return participants;
    }

    /**
     * Sample use case to demonstrate create booking by calling participants which are registered in TCC transaction
     *
     * @return Vector of Booking details returned from participants
     */
    private Vector<Booking> createBookings(String hotelName, String flightNumber) {
        Vector<Booking> ParticipantBookings = new Vector<Booking>();
        Client svcClient = ClientBuilder.newClient();
        /**
         * Hotel booking
         * Participant (Hotel) returns the participant URI's in response header (Header Name: link) as well.
         */
        Response resp = svcClient.target(hotelBookingAppUrl).path("/bookings").queryParam("hotelName", hotelName).request(MediaType.APPLICATION_JSON).post(Entity.json(""));
        if (resp.getStatus() != Response.Status.OK.getStatusCode()) {
            throw new InternalServerErrorException("Hotel booking failed. "+resp.readEntity(String.class));
        }
        Booking hotelBooking = resp.readEntity(Booking.class);
        log.info("Hotel booking details:" + hotelBooking);
        ParticipantBookings.add(hotelBooking);

        /**
         * Flight booking
         * Participant (Flight) returns the participant URI's in response header (Header Name: link) as well.
         */
        resp = svcClient.target(flightBookingAppUrl).path("/bookings").queryParam("flightNumber", flightNumber).request(MediaType.APPLICATION_JSON).post(Entity.json(""));
        if (resp.getStatus() != Response.Status.OK.getStatusCode()) {
            throw new InternalServerErrorException("Flight booking failed. "+resp.readEntity(String.class));
        }
        Booking flightBooking = resp.readEntity(Booking.class);
        log.info("Flight booking details:" + flightBooking);
        ParticipantBookings.add(flightBooking);
        return ParticipantBookings;

    }
}
