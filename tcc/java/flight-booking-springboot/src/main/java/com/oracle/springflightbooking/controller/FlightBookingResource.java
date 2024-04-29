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
package com.oracle.springflightbooking.controller;

import com.oracle.microtx.tcc.MicroTxTccClient;
import com.oracle.microtx.tcc.annotation.TCC;
import com.oracle.springflightbooking.entity.Booking;
import oracle.tmm.tcc.exception.TccUnknownTransactionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@Component
@RequestMapping("api/")
@TCC(timeLimit = 120, timeUnit = ChronoUnit.SECONDS)
public class FlightBookingResource {

    @Value("${booking-base-url}")
    private String bookingBaseUrl;

    @Autowired
    MicroTxTccClient tccClientService;
    int bookingCounter = 0;
    int totalBookingsAllowed = 30;
    Map<String, Booking> bookings = new HashMap<>();

    private static final Logger logger = LoggerFactory.getLogger(FlightBookingResource.class);


    @RequestMapping(value = "bookings", method = RequestMethod.POST)
    public ResponseEntity<?> create(@RequestParam(value="flightNumber", required = true ,defaultValue = "Flight-01") String  flightNumber) throws TccUnknownTransactionException {
        logger.info("Received Create request");
        if (!checkSeatAvailable()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Maximum bookings reached");
        }
        UUID flightBookingId = UUID.randomUUID();
        StringBuilder bookingUri = new StringBuilder().append(bookingBaseUrl).append("/").append(flightBookingId.toString());

        Booking booking = new Booking(bookingUri.toString(), System.currentTimeMillis(), tccClientService.getTimeLimit(),flightBookingId.toString());
        booking.setBookingMetadata("FLIGHT", flightNumber);
        bookings.put(flightBookingId.toString(), booking);
        // Register participant with the TCC transaction
        try {
            // call back define , then pass that URL :
            tccClientService.addTccParticipant(bookingUri.toString());
        } catch (TccUnknownTransactionException e) {
            logger.error("Flight booking failed :" + e.getLocalizedMessage());
            e.printStackTrace();
        }
        logger.info("Booking created:" + booking);
        bookingCounter++;
        return ResponseEntity.ok(booking);
    }

    @RequestMapping(value = "bookings/{bookingId}", method = RequestMethod.PUT)
    public ResponseEntity<?> confirm(@PathVariable String bookingId){
        logger.info("In Confirm booking. Booking ID is [ " + bookingId + " ]");
        Booking booking = bookings.get(bookingId);
        if (booking == null) {
            logger.info(String.format("Booking ID [ %s ] not found", bookingId));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        if (checkIfExpired(booking)) {
            bookings.remove(bookingId);
            logger.info("In Confirm booking. Request expired for booking ID is [ " + bookingId + " ]");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Booking expired" + booking);
        }
        bookings.remove(bookingId);
        logger.info(String.format("Booking ID [ %s ] confirmed", bookingId));
        return ResponseEntity.ok().build();
    }

    @RequestMapping(value = "bookings/{bookingId}", method = RequestMethod.DELETE)
    public ResponseEntity<?> cancel(@PathVariable String bookingId) {
        logger.info("In Cancel booking. Booking ID is [ " + bookingId + " ]");
        Booking booking = bookings.get(bookingId);
        if (booking == null) {
            logger.info(String.format("Booking ID [ %s ] not found", bookingId));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        bookings.remove(bookingId);
        logger.info(String.format("Booking ID [ %s ] is cancelled", bookingId));
        return ResponseEntity.ok().build();
    }

    private boolean checkSeatAvailable() {
        return bookingCounter < totalBookingsAllowed;
    }

    private boolean checkIfExpired(Booking booking) {
        return (System.currentTimeMillis() - booking.getStartTime()) > booking.getExpires();
    }

}