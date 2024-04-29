# Copyright (c) 2023, Oracle and/or its affiliates. **

# The Universal Permissive License (UPL), Version 1.0 **

# Subject to the condition set forth below, permission is hereby granted to any person obtaining a copy of this software, associated documentation and/or data
# (collectively the "Software"), free of charge and under any and all copyright rights in the Software, and any and all patent rights owned or freely licensable by each
# licensor hereunder covering either the unmodified Software as contributed to or provided by such licensor, or (ii) the Larger Works (as defined below), to deal in both
# ** (a) the Software, and (b) any piece of software and/or hardware listed in the lrgrwrks.txt file if one is included with the Software (each a "Larger Work" to which
# the Software is contributed by such licensors), **
# without restriction, including without limitation the rights to copy, create derivative works of, display, perform, and distribute the Software and make, use, sell,
# offer for sale, import, export, have made, and have sold the Software and the Larger Work(s), and to sublicense the foregoing rights on either these or other terms. **

# This license is subject to the following condition: The above copyright notice and either this complete permission notice or at a minimum a reference to the UPL must be
# included in all copies or substantial portions of the Software. **

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
# PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
# CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
import uuid
from json import JSONEncoder

class TransactionHistory():
    def __init__(self, tripBookingId, status, message, flightBooking, hotelBooking):
        self.tripBookingId = str(tripBookingId)
        self.status = status.value
        self.message = message
        self.flightBooking = flightBooking
        self.hotelBooking = hotelBooking

    def __str__(self):
        return "Booking{" + "tripBookingId= " + str(self.tripBookingId) + ", status=" + str(
            self.status) + ", message=" + str(self.message) + ", flightBooking=" + str(self.flightBooking) + ", hotelBooking=" + str(
            self.hotelBooking) + "} "




class BookingHistory:
    def __init__(self):
        self.bookings = {}

    def saveBooking(self, status, message, participants):
        id = uuid.uuid1()
        transactionHistory = TransactionHistory(str(id), status, message, participants[0], participants[1])
        self.bookings[str(id)] = transactionHistory
        return transactionHistory

    def get(self, bookingId):
        if bookingId in self.bookings:
            return self.bookings[bookingId]
        return None

    def set(self, bookingId, trip_booking_record):
        self.bookings[bookingId] = trip_booking_record
        return

    def getAll(self):
        result = []
        for key, value in self.bookings.items():
            result.append(value)
        return result


class BookingHistoryEncoder(JSONEncoder):
    def default(self, o):
        return o.__dict__
