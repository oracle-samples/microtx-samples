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
 
package com.example.tripmanager;

import com.example.tripmanager.model.Booking;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.MediaType;
import io.micronaut.http.client.HttpClient;
import io.micronaut.http.exceptions.HttpStatusException;
import io.micronaut.http.uri.UriBuilder;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.util.Arrays;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Singleton
public class TripService {
    private static final Logger LOG = LoggerFactory.getLogger(TripService.class);

    private Map<String, Booking> bookings = new ConcurrentHashMap<>();

    public void saveProvisionalBooking(Booking booking) throws BookingException {
        bookings.putIfAbsent(booking.getId(), booking);

        //check if any associate booking is a failed booking
        for (Booking associatedBooking : booking.getDetails()) {
            if (associatedBooking.getStatus() == Booking.BookingStatus.FAILED) {
                //cancel the LRA by throwing an exception
                LOG.info(String.format("Cancelling booking id %s (%s) status: %s", booking.getId(), booking.getName(), booking.getStatus()));
                booking.setStatus(Booking.BookingStatus.CANCELLED);
                throw new BookingException(HttpStatus.INTERNAL_SERVER_ERROR.getCode(), String.format("Associate booking failed: %s", booking.getName()));
            }
        }
    }

    public Booking get(String bookingId) throws HttpStatusException {
        if (!bookings.containsKey(bookingId)) {
            throw new HttpStatusException(HttpStatus.NOT_FOUND, "Invalid Booking Id: " + bookingId);
        }
        return bookings.get(bookingId);
    }

    public Collection<Booking> getAll() {
        return bookings.values();
    }

    public void mergeAssociateBookingDetails(Booking tripBooking, UriBuilder hotelTarget, UriBuilder flightTarget) {
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

    private static void mergeAssociateBookingDetails(UriBuilder target, Booking booking) {

        URI uri = target
                .path("/")
                .path(booking.getId())
                .build();

        HttpClient httpClient = HttpClient.create(null);
        HttpRequest<?> request = HttpRequest.GET(uri)
                .accept(MediaType.APPLICATION_JSON_TYPE)
                .contentType(MediaType.APPLICATION_JSON_TYPE);
        HttpResponse<Booking> response = httpClient.toBlocking().exchange(request, Booking.class);
        Booking responseBooking = response.body();
        assert responseBooking != null;
        booking.merge(responseBooking);
    }
}
