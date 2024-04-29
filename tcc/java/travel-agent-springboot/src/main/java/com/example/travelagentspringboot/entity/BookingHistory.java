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
package com.example.travelagentspringboot.entity;

import com.example.travelagentspringboot.Exception.BookingNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.ApplicationScope;

import java.util.*;

@Component
@ApplicationScope
public class BookingHistory {

    private Map<String, TransactionHistory> bookings = new HashMap<>();

    public class TransactionHistory {
        private String tripBookingId;
        private String status;

        private Booking flightBooking;

        private Booking hotelBooking;

        private String message;

        public TransactionHistory() {}

        public TransactionHistory(String tripBookingId, String status, Booking hotelBooking, Booking flightBooking) {
            this.tripBookingId = tripBookingId;
            this.status = status;
            this.hotelBooking = hotelBooking;
            this.flightBooking = flightBooking;
        }

        public String getTripBookingId() {
            return tripBookingId;
        }

        public void setTripBookingId(String tripBookingId) {
            this.tripBookingId = tripBookingId;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Booking getFlightBooking() {
            return flightBooking;
        }

        public void setFlightBooking(Booking flightBooking) {
            this.flightBooking = flightBooking;
        }

        public Booking getHotelBooking() {
            return hotelBooking;
        }

        public void setHotelBooking(Booking hotelBooking) {
            this.hotelBooking = hotelBooking;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        @Override
        public String toString() {
            return "TransactionHistory{" +
                    "tripBookingId='" + tripBookingId + '\'' +
                    ", status='" + status + '\'' +
                    ", flightBooking=" + flightBooking +
                    ", hotelBooking=" + hotelBooking +
                    ", message='" + message + '\'' +
                    '}';
        }
    }

    /**
     * Save the trip booking in memory (HashMap)
     *
     * @param status       - Final Status of the transaction
     * @param participants - Vector of participants Booking status
     */
    public TransactionHistory saveBooking(Vector<Booking> participants, String status, String message) {
        UUID tripBookingId = UUID.randomUUID();
        TransactionHistory Result;
        if (status == "Cancelled") {
            Result = new TransactionHistory(tripBookingId.toString(), status, null , null);
        } else
            Result = new TransactionHistory(tripBookingId.toString(), status, participants.get(0), participants.get(1));

        Result.setMessage(message);
        bookings.put(tripBookingId.toString(), Result);

        return Result;
    }


    /**
     * Update the trip booking in memory (HashMap)
     *
     * @param tripBookingId - Travel agent booking Id
     * @param status               - Status of the transaction
     */
    public TransactionHistory updateBookingStatus(String tripBookingId, String status, String message) {
        TransactionHistory bookingDetails = get(tripBookingId);
        bookingDetails.setStatus(status);
        bookingDetails.setMessage(message);
        bookings.put(tripBookingId, bookingDetails);
        return bookingDetails;
    }

    /**
     * Get trip booking details
     *
     * @param bookingId booking identity
     * @return Booking details
     * @throws BookingNotFoundException
     */
    public TransactionHistory get(String bookingId) throws BookingNotFoundException {
        if (!bookings.containsKey(bookingId)) {
            throw new BookingNotFoundException("Invalid Booking Id: "+ bookingId);
        }
        return bookings.get(bookingId);
    }

    /**
     * Fetch all trip bookings
     *
     * @return all trip booking details
     */
    public Collection<TransactionHistory> getAll() {
        return bookings.values();
    }

}