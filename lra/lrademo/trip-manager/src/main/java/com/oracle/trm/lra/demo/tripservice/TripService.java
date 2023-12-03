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
package com.oracle.trm.lra.demo.tripservice;

import com.oracle.trm.lra.demo.model.Booking;

import javax.enterprise.context.ApplicationScoped;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Response;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import static javax.ws.rs.core.Response.Status.INTERNAL_SERVER_ERROR;

@ApplicationScoped
public class TripService {

    private static final Logger log = Logger.getLogger(TripService.class.getSimpleName());
    private Map<String, Booking> bookings = new HashMap<>();

    /**
     * Save the trip booking in memory (HashMap)
     *
     * @param booking - Trip booking
     * @throws BookingException Exception is throw if one of the associate bookings failed
     */
    public void saveProvisionalBooking(Booking booking) throws BookingException {
        bookings.putIfAbsent(booking.getId(), booking);

        //check if any associate booking is a failed booking
        for (Booking associatedBooking : booking.getDetails()) {
            if (associatedBooking.getStatus() == Booking.BookingStatus.FAILED) {
                //cancel the LRA by throwing an exception
                log.info(String.format("Cancelling booking id %s (%s) status: %s", booking.getId(), booking.getName(), booking.getStatus()));
                booking.setStatus(Booking.BookingStatus.CANCELLED);
                throw new BookingException(INTERNAL_SERVER_ERROR.getStatusCode(), String.format("Associate booking failed: %s", booking.getName()));
            }
        }
    }

    /**
     * Get trip booking details
     *
     * @param bookingId booking identity
     * @return Booking details
     * @throws NotFoundException
     */
    public Booking get(String bookingId) throws NotFoundException {
        if (!bookings.containsKey(bookingId)) {
            throw new NotFoundException(Response.status(404).entity("Invalid Booking Id: " + bookingId).build());
        }
        return bookings.get(bookingId);
    }

    /**
     * Fetch all trip bookings
     *
     * @return all trip booking details
     */
    public Collection<Booking> getAll() {
        return bookings.values();
    }

    /**
     * Fetch associated booking details and confirm the trip booking status
     *
     * @param tripBooking  Trip booking details
     * @param hotelTarget  Hotel service web target
     * @param flightTarget Flight Service web target
     */
    public void mergeAssociateBookingDetails(Booking tripBooking, WebTarget hotelTarget, WebTarget flightTarget) {
        for (Booking associatedBooking : tripBooking.getDetails()) {
            if ("Hotel".equals(associatedBooking.getType())) {
                mergeAssociateBookingDetails(hotelTarget, associatedBooking);
            } else if ("Flight".equals(associatedBooking.getType())) {
                mergeAssociateBookingDetails(flightTarget, associatedBooking);
            }
        }
        // If any associate booking fails, the entire trip fails
        boolean anyAssociatedBookingFailed = Arrays.stream(tripBooking.getDetails()).anyMatch(booking -> booking.getStatus().equals(Booking.BookingStatus.FAILED) || booking.getStatus().equals(Booking.BookingStatus.CANCELLED));
        if (anyAssociatedBookingFailed) {
            tripBooking.setStatus(Booking.BookingStatus.CANCELLED);
        } else {
            tripBooking.setStatus(Booking.BookingStatus.CONFIRMED);
        }
    }

    /**
     * Update the associate booking details in trip booking details
     *
     * @param target  service web target
     * @param booking Associated booking details
     */
    private static void mergeAssociateBookingDetails(WebTarget target, Booking booking) {
        Response response = target.path(booking.getId()).request().get(); // associated service must be listening on this path /bookingId
        booking.merge(response.readEntity(Booking.class));
    }

}
