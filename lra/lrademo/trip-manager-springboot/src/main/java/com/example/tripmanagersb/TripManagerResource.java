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
 
package com.example.tripmanagersb;

import com.example.tripmanagersb.feignclient.FlightFeignClient;
import com.example.tripmanagersb.feignclient.HotelFeignClient;
import com.example.tripmanagersb.model.Booking;
import com.example.tripmanagersb.model.BookingResponse;
import com.oracle.microtx.springboot.lra.annotation.AfterLRA;
import com.oracle.microtx.springboot.lra.annotation.LRA;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static com.oracle.microtx.springboot.lra.annotation.LRA.LRA_HTTP_CONTEXT_HEADER;
import static com.oracle.microtx.springboot.lra.annotation.LRA.LRA_HTTP_ENDED_CONTEXT_HEADER;

@RestController
@RequestMapping("/trip-service/api/sync")
public class TripManagerResource {
    private static final String ORACLE_TMM_TX_TOKEN = "Oracle-Tmm-Tx-Token";

    @Autowired
    private TripService service;

    @Value("${hotel.service.url}")
    private String hotelServiceUri;

    @Value("${flight.service.url}")
    private String flightServiceUri;

    /**
     * RestTemplate must be autowired because then only the client Interceptor will be able to intercept
     * Interceptors are specific to the restTemplate
     */
    @Autowired
    @Qualifier("MicroTxLRA")
    RestTemplate restTemplate;

    @Autowired
    FlightFeignClient flightFeignClient;

    private static final Logger LOG = LoggerFactory.getLogger(TripManagerResource.class);

    @RequestMapping(value = "/trip", method = RequestMethod.POST)
    @LRA(value = LRA.Type.REQUIRES_NEW, end = false)
    public ResponseEntity<?> bookTrip(@RequestParam(value = "hotelName", required = false, defaultValue = "TheGrand") String hotelName,
                                      @RequestParam(value = "flightNumber", required = false, defaultValue = "A123") String flightNumber,
                                      @RequestHeader(LRA_HTTP_CONTEXT_HEADER) String lraId,
                                      @RequestHeader(value = ORACLE_TMM_TX_TOKEN, required = false) String oracleTmmTxToken){

        LOG.info("Started new LRA " + lraId);

        Booking tripBooking = null;
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));
        try {
            LOG.info("Calling LRA participants Hotel booking and Flight booking sequentially");
            Booking flightBooking = null;
            Booking hotelBooking = bookHotel(hotelName, bookingId);
            if (hotelBooking.getStatus() != Booking.BookingStatus.FAILED) {
                flightBooking = bookFlight(flightNumber, bookingId);
            }
            tripBooking = new Booking(bookingId, "Trip", "Trip", hotelBooking, flightBooking);
            service.saveProvisionalBooking(tripBooking);

            return ResponseEntity.ok().header(ORACLE_TMM_TX_TOKEN, oracleTmmTxToken).body(tripBooking);
        } catch (BookingException e) {
            return ResponseEntity.internalServerError().header(ORACLE_TMM_TX_TOKEN, oracleTmmTxToken)
                    .body(tripBooking);
        }
    }

    @RequestMapping(value = "/trip/{bookingId}", method = RequestMethod.GET)
    public ResponseEntity<?> getBooking(@PathVariable("bookingId") String bookingId) {
        return ResponseEntity.ok(service.get(bookingId));
    }

    @RequestMapping(value = "/trip/{bookingId}", method = RequestMethod.PUT)
    @LRA(value = LRA.Type.MANDATORY, end = true)
    public ResponseEntity<?> confirmTrip(@PathVariable String bookingId){
        LOG.info("Received Confirmation for trip booking with Id : " + bookingId);
        Booking tripBooking = service.get(bookingId);
        if (tripBooking.getStatus() == Booking.BookingStatus.CANCEL_REQUESTED) {
            return ResponseEntity.badRequest().body("Cannot confirm a trip booking that needs to be cancelled");
        }
        return ResponseEntity.ok(new BookingResponse("Confirm booking requested"));
    }

    @RequestMapping(value = "/trip/{bookingId}", method = RequestMethod.DELETE)
    @LRA(value = LRA.Type.MANDATORY, end = true, cancelOn = HttpStatus.OK)
    public ResponseEntity<?> cancelTrip(@PathVariable String bookingId){
        LOG.info("Received Cancellation for trip booking with Id : " + bookingId);
        return ResponseEntity.ok(new BookingResponse("Cancel booking requested"));
    }

    @RequestMapping(value = "/trip", method = RequestMethod.GET)
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @RequestMapping(value = "/after", method = RequestMethod.PUT)
    @AfterLRA
    public ResponseEntity<?> afterLra(@RequestHeader(LRA_HTTP_ENDED_CONTEXT_HEADER) String lraId, @RequestBody String status){
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));
        LOG.info("After LRA Called : " + lraId);
        LOG.info("Final LRA Status : " + status);
        Booking tripBooking = service.get(bookingId);
        if (tripBooking != null) {
            // Fetch the final status of hotel and flight booking
            service.mergeAssociateBookingDetails(tripBooking, getHotelTarget(), getFlightTarget());
        }
        // Clean up of resources held by this LRA
        return ResponseEntity.ok().build();
    }

    private Booking bookHotel(String name, String id) {
        LOG.info("Calling Hotel Service to book hotel with booking Id : " + id);

        URI hotelUri = getHotelTarget()
                .queryParam("hotelName", name)
                .build()
                .toUri();

        Booking hotelBooking = restTemplate.postForEntity(hotelUri, null, Booking.class).getBody();

        assert hotelBooking != null;
        LOG.info(String.format("Hotel booking %s with booking Id : %s", (hotelBooking.getStatus() == Booking.BookingStatus.FAILED ? "FAILED" : "SUCCESSFUL"), hotelBooking.getId()));
        return hotelBooking;
    }

    private Booking bookFlight(String flightNumber, String id) {
        LOG.info("Calling Flight Service to book flight with booking Id : " + id);

        /***
         // Uncomment this to use restTemplate in place of feign client
        URI flightUri = getFlightTarget()
                .queryParam("flightNumber", flightNumber)
                .build()
                .toUri();

        flightBooking = restTemplate.postForEntity(flightUri, null, Booking.class).getBody();
        ***/

        Booking flightBooking = flightFeignClient.bookFlight(flightNumber);

        assert flightBooking != null;
        LOG.info(String.format("Flight booking %s with booking Id : %s", (flightBooking.getStatus() == Booking.BookingStatus.FAILED ? "FAILED" : "SUCCESSFUL"), flightBooking.getId()));
        return flightBooking;
    }

    private UriComponentsBuilder getHotelTarget(){
        return UriComponentsBuilder.fromUri(URI.create(hotelServiceUri));
    }

    private UriComponentsBuilder getFlightTarget(){
        return UriComponentsBuilder.fromUri(URI.create(flightServiceUri));
    }
}