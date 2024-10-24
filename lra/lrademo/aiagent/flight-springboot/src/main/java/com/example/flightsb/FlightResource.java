package com.example.flightsb;

import com.example.flightsb.model.Booking;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/flightService/api")
public class FlightResource {
    private static final Logger LOG = LoggerFactory.getLogger(FlightResource.class);

    @Autowired
    private FlightService flightService;

    @RequestMapping(value = "/flight", method = RequestMethod.POST)
    public ResponseEntity<?> bookFlight(@RequestParam(value = "flightNumber", required = false, defaultValue = "Default") String flightNumber,
                                        @RequestParam(value = "bookingId", required = false) String bookingId){
        Booking booking = flightService.book(bookingId, flightNumber);
        LOG.info("Flight Booking created: " + booking);
        return ResponseEntity.ok(booking);
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
