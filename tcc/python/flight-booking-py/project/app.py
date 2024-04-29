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
import json
import logging.config
import time
from tcclib.tcc import Middleware, TCCConfig
import models.Booking
import uuid
import traceback
from models.Booking import BookingEncoder
import os

logging.basicConfig()
logger = logging.getLogger()
logger.setLevel(logging.INFO)

from flask import Flask, make_response, jsonify, request, Response

app = Flask(__name__)
app.wsgi_app = Middleware(app.wsgi_app)

# TODO - put these in application config file
service_port = '8082'
tmm_TcsUrl = 'http://127.0.0.1:9000/api/v1'
rmEndPoint = 'http://localhost:8082'
booking_base_url = 'http://localhost:8082/api/bookings'
if os.getenv("BOOKING_BASE_URL", default=None):
    booking_base_url = os.getenv("BOOKING_BASE_URL", default=None)

total_bookings_allowed = 30

bookings = {}
appl_properties_file_path = 'project/tmm.properties'

tccConfig = TCCConfig(filePath=appl_properties_file_path, timeLimitInSeconds=300)

currBookingID = 0


@app.route('/')
def index():
    return make_response(jsonify
                         ({'POST REQUEST': '/api/bookings', 'PUT REQUEST': '/api/bookings/<bookingId>',
                           'DELETE REQUEST': '/api/bookings/<bookingId>'}), 200)


@app.route('/api/bookings', methods=['POST'])
def doFlightBooking():
    global currBookingID
    logger.info("Received Create request")
    if currBookingID >= total_bookings_allowed:
        return make_response(jsonify({'message': 'maximum booking reached'}), 500)
    flightBookingId = str(uuid.uuid1())

    flight_number = request.args.get('flightNumber')
    if not flight_number:
        flight_number = 'Flight-01'

    bookingUri = booking_base_url + "/" + str(flightBookingId)

    currBookingID += 1
    booking = models.Booking.Booking(bookingUri, int(time.time() * 1000), tccConfig.timeInMilliSeconds, flightBookingId, flight_number)
    global bookings
    bookings[flightBookingId] = booking
    try:
        tccConfig.addTccParticipant(bookingUri)
    except Exception as e:
        logger.error('Failed with exception [%s]' % e)
        traceback.print_exc()
        return make_response(jsonify({'message': 'flight booking failed'}), 500)
    logger.info("booking created " + str(booking))

    json_response = json.dumps(booking, cls=BookingEncoder)
    response = Response(json_response, content_type='application/json; charset=utf-8')
    response.status_code = 200
    return response


@app.route('/api/bookings/<bookingId>', methods=['PUT'])
def doConfirmBooking(bookingId):
    global bookings
    logger.info("In Confirm booking. Booking ID is [ " + str(bookingId) + " ]")
    booking = bookings[bookingId]
    if booking is None:
        return make_response(jsonify({'message': 'booking not found'}), 404)
    if checkIfExpired(booking):
        del bookings[bookingId]
        logger.error("In Confirm booking. Request expired for booking ID is [ " + str(bookingId) + " ]")
        return make_response(jsonify({'message': 'flight Booking expired'}), 500)
    del bookings[bookingId]
    return make_response(jsonify({'Successful': 'OK'}), 200)


@app.route('/api/bookings/<bookingId>', methods=['DELETE'])
def doCancelBooking(bookingId):
    logger.info("In Cancel booking. Booking ID is [ " + bookingId + " ]")
    booking = bookings[bookingId]
    if booking is None:
        logger.error("booking not found")
        return make_response(jsonify({'message': 'booking not found'}), 404)
    del bookings[bookingId]
    return make_response(jsonify({'cancel': 'OK'}), 200)


def checkIfExpired(booking):
    return (int(time.time() * 1000) - booking.startTime) > booking.expires


if __name__ == '__main__':
    logger.info("flight booking Service 1 on port: " + str(service_port))
    app.run(host='0.0.0.0', port=int(service_port))
