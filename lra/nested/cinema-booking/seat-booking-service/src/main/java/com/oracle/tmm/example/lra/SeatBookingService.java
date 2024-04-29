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

import javax.enterprise.context.ApplicationScoped;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@ApplicationScoped
public class SeatBookingService {
    private Map<String, Booking> bookings = new HashMap<>();
    private Map<String, Seat> seats = new HashMap<>();
    private int maxSeats = 20;

    public SeatBookingService() {
        // Initialize seats with max allowed seats value
        for (int i = 0; i < maxSeats ; i++) {
            String seatId = "s" + i;
            seats.put(seatId, new Seat(seatId));
        }
    }

    Seat getSeatById(String id) {
        return seats.get(id);
    }

    public List<Seat> getAllSeats() {
        return seats.values().stream().collect(Collectors.toList());
    }

    public Optional<Booking> getBookingByLraId(URI lraId) {
        Booking booking = bookings.get(lraId);
        return Optional.of(booking);
    }

    public void confirmBooking(String lraId) {
        Booking booking = bookings.get(lraId);
        markSeatBooked(booking.getSeatId());
    }

    public void markSeatBooked(String seatId) {
        Seat seat = seats.get(seatId);
        seat.setStatus(Seat.SeatStatus.BOOKED);
        seats.put(seatId, seat);
    }

    public Optional<Booking> clearBooking(String lraId) {
        Booking booking = bookings.get(lraId);
        markSeatAvailable(booking.getSeatId());
        bookings.remove(lraId);

        return Optional.of(booking);
    }

    public void markSeatAvailable(String seatId) {
        Seat seat = seats.get(seatId);
        seat.setStatus(Seat.SeatStatus.AVAILABLE);
        seats.put(seatId, seat);
    }

    public Booking createBooking(BookingRequest request, String lraId) throws Exception {
        if (!seats.containsKey(request.getSeatId())) {
            throw new Exception("Invalid seat number");
        }
        Seat seat = seats.get(request.getSeatId());
        if (!seat.getStatus().equals(Seat.SeatStatus.AVAILABLE)) {
            throw new Exception("Seat " + seat.getId()  + " is not already reserved");
        }

        // mark seat as reserved
        seat.setStatus(Seat.SeatStatus.RESERVED);
        seats.put(seat.getId(), seat);

        Booking booking = new Booking(request.getName(), lraId, seat.getId());
        bookings.put(lraId, booking);

        return booking;
    }
}
