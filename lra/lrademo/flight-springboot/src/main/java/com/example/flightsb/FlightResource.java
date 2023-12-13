package com.example.flightsb;

import com.example.flightsb.model.Booking;
import com.oracle.microtx.springboot.lra.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static com.oracle.microtx.springboot.lra.annotation.LRA.*;


@RestController
@RequestMapping("/flightService/api")
public class FlightResource {
    private static final Logger LOG = LoggerFactory.getLogger(FlightResource.class);

    @Autowired
    private FlightService flightService;

    @RequestMapping(value = "/flight", method = RequestMethod.POST)
    @LRA(value = LRA.Type.MANDATORY, end = false)
    public ResponseEntity<?> bookRoom(@RequestHeader(value = LRA_HTTP_CONTEXT_HEADER) String lraId,
                                      @RequestParam(value = "flightNumber", required = false, defaultValue = "Default") String flightNumber){
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));
        Booking booking = flightService.book(bookingId, flightNumber);
        LOG.info("Flight Booking created: " + booking);
        return ResponseEntity.ok(booking);
    }

    @RequestMapping(value = "/complete", method = RequestMethod.PUT)
    @Complete
    public ResponseEntity<?> completeWork(@RequestHeader(LRA_HTTP_CONTEXT_HEADER) String lraId){
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

    @RequestMapping(value = "/compensate", method = RequestMethod.PUT)
    @Compensate
    public ResponseEntity<?>  compensateWork(@RequestHeader(LRA_HTTP_CONTEXT_HEADER) String lraId){
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

    @RequestMapping(value = "/forget", method = RequestMethod.DELETE)
    @Forget
    public ResponseEntity<?> forget(@RequestHeader(LRA_HTTP_CONTEXT_HEADER) String lraId, @RequestHeader(LRA_HTTP_PARENT_CONTEXT_HEADER) String parentLraID){
        LOG.info("Forget called");
        if(lraId == null){
            return new ResponseEntity<>("LRA header not present", HttpStatus.BAD_REQUEST);
        }
        if(parentLraID != null){
            LOG.info("Parent Lra is active");
            //If parent called complete then this gets invoked in child if it got completed. In this we set the work of child to completed if it's provisionally set.
            //Then we clean up the held resources by this(child).
        }
        return ResponseEntity.ok("Cleaned Up");
    }

    @RequestMapping(value = "/status", method = RequestMethod.GET)
    @Status
    public ResponseEntity<?> status(@RequestHeader(LRA_HTTP_CONTEXT_HEADER) String lraId, @RequestHeader(LRA_HTTP_PARENT_CONTEXT_HEADER) String parentLRA){
        LOG.info("FlightServiceResource status() called for LRA : " + lraId);
        if (parentLRA != null) { // is the context nested
            // code which is sensitive to executing with a nested context goes here
        }
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));
        Booking.BookingStatus status = flightService.get(bookingId).getStatus();
        // Business logic (provided by the business developer)
        if(status == Booking.BookingStatus.CONFIRMED) {
            return ResponseEntity.ok(ParticipantStatus.Completed);
        }
        return ResponseEntity.ok(ParticipantStatus.Compensated);
    }

    @RequestMapping(value = "/after", method = RequestMethod.PUT)
    @AfterLRA
    public ResponseEntity<?> after(@RequestHeader(LRA_HTTP_ENDED_CONTEXT_HEADER) String lraId, @RequestBody String status){
        LOG.info("After LRA Called : " + lraId);
        LOG.info("Final LRA Status : " + status);
        // Clean up of resources held by this LRA
        return ResponseEntity.ok().build();
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
