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

package com.example.flightsb;

import com.example.flightsb.model.Booking;
import com.oracle.microtx.springboot.lra.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static com.oracle.microtx.springboot.lra.annotation.LRA.LRA_HTTP_CONTEXT_HEADER;

@RestController
@RequestMapping("/flightServiceNonRest/api")
public class FlightResourceNonRest {
    private static final Logger LOG = LoggerFactory.getLogger(FlightResourceNonRest.class);

    @Autowired
    private FlightService flightService;

    @RequestMapping(value = "/flight", method = RequestMethod.POST)
    @LRA(value = LRA.Type.MANDATORY, end = false)
    public ResponseEntity<?> bookRoom(@RequestHeader(value = LRA_HTTP_CONTEXT_HEADER) String lraId,
                                      @RequestParam(value = "flightName", required = false, defaultValue = "Default") String flightName){
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));
        Booking booking = flightService.book(bookingId, flightName);
        LOG.info("Flight Booking created: " + booking);
        return ResponseEntity.ok(booking);
    }

    @RequestMapping(value = "/leave", method = RequestMethod.PUT)
    @Leave
    public ResponseEntity<?> leave(@RequestHeader(LRA_HTTP_CONTEXT_HEADER) String lraId){
        LOG.info("Leave called");
        if(lraId == null){
            return new ResponseEntity<>("LRA header not present", HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok("Left LRA");
    }

    @Complete
    public ResponseEntity<?> completeWork(URI lraIdUri){
        String lraId = String.valueOf(lraIdUri);
        LOG.info("FlightServiceResource complete() called for LRA : " + lraId);
        // Business logic to complete the work related to this LRA
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));

        Booking booking = flightService.get(bookingId);

        if(booking == null){
            return new ResponseEntity<>("Flight booking not found", HttpStatus.NOT_FOUND);
        }
        if (booking.getStatus() == Booking.BookingStatus.PROVISIONAL) {
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
            return ResponseEntity.ok(ParticipantStatus.Completed.name());
        }
        booking.setStatus(Booking.BookingStatus.FAILED);
        return ResponseEntity.ok(ParticipantStatus.FailedToComplete.name());
    }

    @Compensate
    public ResponseEntity<?>  compensateWork(URI lraIdUri){
        String lraId = String.valueOf(lraIdUri);
        LOG.info("FlightServiceResource compensate() called for LRA : " + lraId);
        // Business logic to compensate the work related to this LRA
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));
        Booking booking = flightService.get(bookingId);
        if(booking == null){
            return new ResponseEntity<>("Flight booking not found", HttpStatus.NOT_FOUND);
        }
        if (booking.getStatus() == Booking.BookingStatus.PROVISIONAL) {
            booking.setStatus(Booking.BookingStatus.CANCELLED);
            return ResponseEntity.ok(ParticipantStatus.Compensated.name());
        }
        booking.setStatus(Booking.BookingStatus.FAILED);
        return ResponseEntity.ok(ParticipantStatus.FailedToCompensate.name());
    }

    @Forget
    public ResponseEntity<?> forget(URI lraIdUri){
        String lraId = String.valueOf(lraIdUri);
        LOG.info("Forget called");
        if(lraId == null){
            return new ResponseEntity<>("LRA header not present", HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok("Cleaned Up");
    }
    @AfterLRA
    public ResponseEntity<?> after(URI lraId, LRAStatus status){
        LOG.info("After LRA Called : " + lraId);
        LOG.info("Final LRA Status : " + status);
        // Clean up of resources held by this LRA
        return ResponseEntity.ok().build();
    }

    @Status
    public ResponseEntity<?> status(URI lraIdUri){
        String lraId = String.valueOf(lraIdUri);
        LOG.info("FlightServiceResource status() called for LRA : " + lraId);
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));
        Booking.BookingStatus status = flightService.get(bookingId).getStatus();
        // Business logic (provided by the business developer)
        if(status == Booking.BookingStatus.CONFIRMED) {
            return ResponseEntity.ok(ParticipantStatus.Completed);
        }
        return ResponseEntity.ok(ParticipantStatus.Compensated);
    }

    @RequestMapping(value = "/flight/{bookingId}", method = RequestMethod.GET)
    public ResponseEntity<?> getBooking(@PathVariable("bookingId") String bookingId) {
        LOG.info("Get Flight Booking : " + bookingId);
        return ResponseEntity.ok(flightService.get(bookingId));
    }

    @RequestMapping(value = "/flight", method = RequestMethod.GET)
    public ResponseEntity<?> getAll(){
        LOG.info("Get All Flight bookings");
        return ResponseEntity.ok(flightService.getAll());
    }

    @RequestMapping(value = "/maxbookings", method = RequestMethod.PUT)
    public ResponseEntity<?> setMaxBookingCount(@RequestParam(value = "count", required = false, defaultValue = "3") Integer maxBookingCount) {
        FlightService.MAX_BOOKING = maxBookingCount;
        LOG.info("Set Max Flight Booking Count: " + maxBookingCount);
        return ResponseEntity.ok(maxBookingCount);
    }
}
