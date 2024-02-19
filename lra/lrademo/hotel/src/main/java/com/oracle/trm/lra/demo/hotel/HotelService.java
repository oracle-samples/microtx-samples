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

package com.oracle.trm.lra.demo.hotel;

import com.oracle.trm.lra.demo.model.Booking;

import javax.enterprise.context.ApplicationScoped;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.core.Response;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

@ApplicationScoped
public class HotelService {
    private Map<String, Booking> bookings = new ConcurrentHashMap<>();
    public static int MAX_BOOKING = 3;

    private static final Logger log = Logger.getLogger(HotelResource.class.getSimpleName());

    /**
     * Save the hotel booking in memory (HashMap)
     * @param bookingId Hotel booking Identity
     * @param hotel Hotel name to be booked
     * @return hotel booking details
     */
    public Booking book(String bookingId, String hotel) {
        Booking booking = new Booking(bookingId, hotel, "Hotel", null);
        if(bookings.size() >= MAX_BOOKING){
            booking.setStatus(Booking.BookingStatus.FAILED);
            log.severe(String.format("Cannot confirm Hotel booking as maximum allowed booking limit [%s] has been reached", MAX_BOOKING));
        }
        Booking earlierBooking = bookings.putIfAbsent(booking.getId(), booking);
        return earlierBooking == null ? booking : earlierBooking;
    }

    /**
     * Get hotel booking details
     * @param bookingId Hotel booking Identity
     * @return hotel booking details
     * @throws NotFoundException
     */
    public Booking get(String bookingId) throws NotFoundException {
        if (!bookings.containsKey(bookingId)) {
            throw new NotFoundException(Response.status(404).entity("Invalid Booking id: " + bookingId).build());
        }
        return bookings.get(bookingId);
    }

    /**
     * Get all hotel bookings
     * @return all hotel bookings
     */
    public Collection<Booking> getAll() {
        return bookings.values();
    }
}
