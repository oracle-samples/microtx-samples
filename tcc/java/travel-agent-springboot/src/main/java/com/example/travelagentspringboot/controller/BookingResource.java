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
package com.example.travelagentspringboot.controller;

import com.example.travelagentspringboot.Exception.ErrorResponse;
import com.example.travelagentspringboot.entity.Booking;
import com.example.travelagentspringboot.entity.BookingHistory;
import com.example.travelagentspringboot.entity.BookingStatus;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.oracle.microtx.tcc.MicroTxTccClient;
import com.oracle.microtx.tcc.annotation.TCC;

import oracle.tmm.tcc.TccParticipantStatus;
import oracle.tmm.tcc.exception.TccException;
import oracle.tmm.tcc.exception.TccHeuristicException;
import oracle.tmm.tcc.exception.TccUnknownTransactionException;
import oracle.tmm.tcc.vo.CancelResponse;
import oracle.tmm.tcc.vo.ConfirmResponse;
import oracle.tmm.tcc.vo.TccParticipant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;



import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Vector;

@RestController
@Component
@RequestMapping("/travel-agent/api")
@TCC
public class BookingResource {

    @Autowired
    private BookingHistory service;

    @Autowired
    @Qualifier("MicroTxTccRestTemplate")
    RestTemplate restTemplate;

    @Value("${participants.hotel-booking-app-url}")
    private String hotelParticipant;

    @Value("${participants.flight-booking-app-url}")
    private String flightPaticipant;

    @Autowired
    MicroTxTccClient tccClientService;
    private static final Logger logger = LoggerFactory.getLogger(BookingResource.class);


    @RequestMapping(value = "/bookings", method = RequestMethod.GET)
    public ResponseEntity<?> getBooking() {
        return ResponseEntity.ok(service.getAll());
    }

    @RequestMapping(value="/bookings/{tripBookingId}" , method = RequestMethod.GET)
    public ResponseEntity<?> getBooking(@PathVariable String tripBookingId) {
        return ResponseEntity.ok(service.get(tripBookingId));
    }

    @RequestMapping(value = "/bookings" , method = RequestMethod.POST)
    public ResponseEntity<?> booking(@RequestParam(value="cancel", required = false , defaultValue = "false") Boolean cancel,@RequestParam(value="hotelName", required = true ,defaultValue = "Hotel-01") String hotelName, @RequestParam(value="flightNumber", required = true ,defaultValue = "Flight-01") String flightNumber ){
        try {
            Vector<Booking> ParticipantBookings = createBookings(hotelName, flightNumber);
            logger.info("MicroTx TCC Transaction Id : "+tccClientService.getTransactionId());
            // Confirm tcc transaction
            if (cancel) {
                CancelResponse cancelResponse = tccClientService.cancel();
                logger.info("Cancel response" + cancelResponse);
                return ResponseEntity.ok().body(service.saveBooking(ParticipantBookings, BookingStatus.CANCELLED.name(), "Trip Booking has been cancelled"));
            }
            ConfirmResponse confirmResponse = tccClientService.confirm();
            logger.info("Confirm response " + confirmResponse.toString());
            return ResponseEntity.ok().body(service.saveBooking(ParticipantBookings, BookingStatus.CONFIRMED.name(), "Successfully booked the trip"));
        }  catch (TccException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        } catch (TccUnknownTransactionException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (TccHeuristicException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @RequestMapping(value ="/bookings/reserve" , method = RequestMethod.POST)
    public ResponseEntity<?> reservation(@RequestParam(value="hotelName", required = true ,defaultValue = "Hotel-01") String hotelName, @RequestParam(value="flightNumber", required = true ,defaultValue = "Flight-01") String flightNumber){
        try {
            Vector<Booking> participantBookings = createBookings(hotelName, flightNumber);
            logger.info("MicroTx TCC Transaction Id : "+tccClientService.getTransactionId());
            return ResponseEntity.ok(service.saveBooking(participantBookings,BookingStatus.RESERVED.name(), "Trip Reservation was successful"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(e.getMessage()));
        }
    }

    @RequestMapping(value ="/confirm/{tripBookingId}" , method =  RequestMethod.PUT)
    public ResponseEntity<?> confirm(@PathVariable String tripBookingId){
        try {
            BookingHistory.TransactionHistory transactionHistory = service.get(tripBookingId);
            List<TccParticipant> participants = getTravelParticipants(transactionHistory);
            ConfirmResponse confirmResponse = tccClientService.confirm(participants);
            logger.info("MicroTx TCC Transaction Id : "+tccClientService.getTransactionId());
            logger.info("Confirm response : " + confirmResponse.toString());
            if (hasAllParticipantsConfirmed(confirmResponse)) {
                return  ResponseEntity.status(HttpStatus.OK).body(service.updateBookingStatus(tripBookingId, BookingStatus.CONFIRMED.name(),"Booking confirmed Successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(service.updateBookingStatus(tripBookingId, BookingStatus.FAILED.name(), "Booking confirmation Failed"));
            }
        }catch(TccException e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to confirm booking "+e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(e.getMessage()));
        }
    }

    @RequestMapping(value ="/cancel/{tripBookingId}",method =  RequestMethod.DELETE)
    public ResponseEntity<?> cancel(@PathVariable String tripBookingId){
        try{
        BookingHistory.TransactionHistory transactionHistory = service.get(tripBookingId);
        List<TccParticipant> participants = getTravelParticipants(transactionHistory);
        CancelResponse cancelResponse = tccClientService.cancel(participants);
        logger.info("MicroTx TCC Transaction Id : "+tccClientService.getTransactionId());
        logger.info("Cancel response : " + cancelResponse.toString());
        if (hasAllParticipantsCancelled(cancelResponse)) {
            return ResponseEntity.status(HttpStatus.OK).body(service.updateBookingStatus(tripBookingId, BookingStatus.CANCELLED.name(),"Booking cancelled Successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(service.updateBookingStatus(tripBookingId, BookingStatus.FAILED.name(), "Cancellation of booking failed"));
        }
    } catch(TccException e){
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to cancel booking "+e.getMessage()));
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(e.getMessage()));
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

    private UriComponentsBuilder getHotelUri(){
        return UriComponentsBuilder.fromUri(URI.create(hotelParticipant));
    }

    private UriComponentsBuilder getFlightUri(){
        return UriComponentsBuilder.fromUri(URI.create(flightPaticipant));
    }

    /**
     * Sample use case to demonstrate create booking by calling participants which are registered in TCC transaction
     *
     * @return Vector of Booking details returned from participants
     */
    private Vector<Booking> createBookings(String hotelName, String flightNumber) {
        ObjectMapper objectMapper = new ObjectMapper( );
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        Vector<Booking> ParticipantBookings = new Vector<Booking>();

        try {
            /**
             * Hotel booking
             * Participant (Hotel) returns the participant URI's in response header (Header Name: link) as well.
             */
            URI hotelUri = getHotelUri()
                    .path("/bookings")
                    .queryParam("hotelName", hotelName)
                    .build()
                    .toUri();
            ResponseEntity<String> resp = restTemplate.postForEntity(hotelUri, null, String.class);

            if (resp.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("Hotel booking failed. " + resp.getBody());
            }
            Booking hotelBooking = objectMapper.readValue(resp.getBody(), Booking.class);
            logger.info("Hotel booking details:" + hotelBooking);
            ParticipantBookings.add(hotelBooking);

            /**
             * Flight booking
             * Participant (Flight) returns the participant URI's in response header (Header Name: link) as well.
             */

            URI flightUri = getFlightUri()
                    .path("/bookings")
                    .queryParam("flightNumber", flightNumber)
                    .build()
                    .toUri();
            ResponseEntity<String> flightResp = restTemplate.postForEntity(flightUri, null, String.class);

            if (flightResp.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("Hotel booking failed. " + resp.getBody());
            }

            Booking flightBooking = objectMapper.readValue(flightResp.getBody(), Booking.class);
            logger.info("Flight booking details:" + flightBooking);
            ParticipantBookings.add(flightBooking);
        }catch (JsonMappingException e){
            logger.error("Issue in Deserialization {}",e.getMessage());
        } catch (JsonProcessingException e){
            logger.error("Issue in Deserialization {}",e.getMessage());
        }
        return ParticipantBookings;
    }

}