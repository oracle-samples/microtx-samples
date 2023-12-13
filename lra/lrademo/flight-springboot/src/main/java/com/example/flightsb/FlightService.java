package com.example.flightsb;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.example.flightsb.model.Booking;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@Service
public class FlightService {

    private Map<String, Booking> bookings = new HashMap<>();
    public static int MAX_BOOKING = 3;

    private static final Logger LOG = LoggerFactory.getLogger(FlightResource.class);

    public Booking book(String bookingId, String flight) {
        Booking booking = new Booking(bookingId, flight, "Flight", null);
        if(bookings.size() >= MAX_BOOKING){
            booking.setStatus(Booking.BookingStatus.FAILED);
            LOG.error("Cannot confirm Flight booking as maximum allowed booking limit {} has been reached", MAX_BOOKING);
        }
        Booking earlierBooking = bookings.putIfAbsent(booking.getId(), booking);
        return earlierBooking == null ? booking : earlierBooking;
    }

    public Booking get(String bookingId) throws ResponseStatusException {
        if (!bookings.containsKey(bookingId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid Booking id: " + bookingId);
        }
        return bookings.get(bookingId);
    }

    public Collection<Booking> getAll() {
        return bookings.values();
    }

}
