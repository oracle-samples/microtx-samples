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
import models.Booking
import traceback
import models.BookingHistory as bh
from models.booking_status import BookingStatus
from flask import Flask, request, make_response, jsonify
from tcclib.tcc import TCCClient, Middleware, http_request, TCCConfig, TccParticipant
import tcclib.exception as ex
import os
import logging

app = Flask(__name__)
app.wsgi_app = Middleware(app.wsgi_app)

# TODO - put these in application config file
service_port = '8080'
hotelBookingAppUrl = 'http://localhost:8081/api'
flightBookingAppUrl = 'http://localhost:8082/api'
if os.getenv("HOTEL_SERVICE_URL", default=None):
    hotelBookingAppUrl = os.getenv("HOTEL_SERVICE_URL", default=None)
if os.getenv("FLIGHT_SERVICE_URL", default=None):
    flightBookingAppUrl = os.getenv("FLIGHT_SERVICE_URL", default=None)
appl_properties_file_path = 'project/tmm.properties'

history = bh.BookingHistory()
tccConfig = TCCConfig(filePath=appl_properties_file_path, timeLimitInSeconds=300)
logging.basicConfig()
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def create_bookings():
    participant_bookings = []
    # response = requests.request("POST", hotelBookingAppUrl + '/bookings')
    booking_api_response = http_request("POST", hotelBookingAppUrl + '/bookings')
    if booking_api_response.status_code != 200:
        raise ex.InternalServerErrorException("Hotel Booking failed " + str(booking_api_response.content, 'UTF-8'))
    booking_response_json = booking_api_response.json()
    logger.info(booking_response_json)
    hotel_booking = models.Booking.Booking(booking_response_json['bookingUri'], booking_response_json['startTime'], booking_response_json['expires'],
                                           booking_response_json['bookingId'], booking_response_json['name'])
    participant_bookings.append(hotel_booking)

    booking_api_response = http_request("POST", flightBookingAppUrl + '/bookings')
    if booking_api_response.status_code != 200:
        raise ex.InternalServerErrorException("flight Booking failed " + str(booking_api_response.content, 'UTF-8'))
    booking_response_json = booking_api_response.json()
    logger.info(booking_response_json)
    flight_booking = models.Booking.Booking(booking_response_json['bookingUri'], booking_response_json['startTime'], booking_response_json['expires'],
                                            booking_response_json['bookingId'], booking_response_json['name'])
    participant_bookings.append(flight_booking)
    return participant_bookings


@app.route('/travel-agent/api/bookings', methods=['POST'])
def do_booking():
    logger.info("Received Create request")
    try:
        participant_bookings = create_bookings()
        if request.args.get('cancel'):
            cancel_response = TCCClient.CancelTCC(request.headers)
            logger.info(cancel_response)
            bookingH = history.saveBooking(BookingStatus.CANCELLED, "Trip Booking has been cancelled", participant_bookings)
            return make_response(json.loads(json.dumps(bookingH, cls=bh.BookingHistoryEncoder)), 200)

        confirm_response = TCCClient.ConfirmTCC(request.headers)
        logger.info(confirm_response)
        bookingH = history.saveBooking(BookingStatus.CONFIRMED, "Successfully booked the trip" , participant_bookings)
        return make_response(json.loads(json.dumps(bookingH, cls=bh.BookingHistoryEncoder)), 200)
    except (ex.InternalServerErrorException, ex.TccException) as e:
        logger.error('Failed with exception [%s]' % e)
        traceback.print_exc()
        return make_response(jsonify({'message': 'server error '+str(e)}), 500)
    except ex.TccUnknownTransactionException as e:
        logger.error('Failed with exception [%s]' % e)
        traceback.print_exc()
        return make_response(jsonify({'message': 'Not found'}), 404)
    except ex.TccHeuristicException as e:
        logger.error('Failed with exception [%s]' % e)
        traceback.print_exc()
        return make_response(jsonify({'message': 'Not found'}), 409)
    except Exception as e:
        logger.error('Failed with exception [%s]' % e)
        traceback.print_exc()
        return make_response(jsonify({'message': 'Not found'}), 409)


@app.route('/travel-agent/api/bookings/reserve', methods=['POST'])
def do_trip_reserve():
    logger.info("Received trip reservation request")
    try:
        participant_bookings = create_bookings()
        booking_history = history.saveBooking(BookingStatus.RESERVED, "Trip Reservation was successful", participant_bookings)
        return make_response(json.loads(json.dumps(booking_history, cls=bh.BookingHistoryEncoder)), 200)
    except (ex.InternalServerErrorException, ex.TccException) as e:
        logger.error('Trip Booking reservation failed with exception [%s]' % e)
        traceback.print_exc()
        return make_response(jsonify({'server error': '500', 'message': str(e)}), 500)
    except Exception as e:
        logger.error('Trip Booking reservation failed with exception [%s]' % e)
        traceback.print_exc()
        return make_response(jsonify({'message': str(e)}), 500)


@app.route('/travel-agent/api/confirm/<trip_booking_id>', methods=['PUT'])
def do_trip_confirm(trip_booking_id):
    logger.info("Received confirm trip booking request")
    try:
        trip_booking_record = history.get(trip_booking_id)
        if trip_booking_record is None:
            return make_response(jsonify({'response': 'bookingId not found'}), 404)
        participants = get_travel_participants(trip_booking_record)
        confirm_response = TCCClient.ConfirmTCCByParticipants(request.headers, participants)
        logger.info(confirm_response)
        if confirm_response.status_code == 200:
            trip_booking_record.status = BookingStatus.CONFIRMED.value
            trip_booking_record.message = "Booking confirmed Successfully"
            history.set(trip_booking_id, trip_booking_record)
            return make_response(json.loads(json.dumps(history.get(trip_booking_id), cls=bh.BookingHistoryEncoder)), 200)
        else:
            trip_booking_record.status = BookingStatus.FAILED.value
            trip_booking_record.message = "Booking confirmation failed "+ str(confirm_response)
            history.set(trip_booking_id, trip_booking_record)
            return make_response(json.loads(json.dumps(history.get(trip_booking_id), cls=bh.BookingHistoryEncoder)), 500)
    except (ex.InternalServerErrorException, ex.TccException) as e:
        logger.error('Trip Booking confirmation failed with exception [%s]' % e)
        traceback.print_exc()
        return make_response(jsonify({'message': str(e)}), 500)
    except ex.TccUnknownTransactionException as e:
        logger.error('Trip Booking confirmation failed with exception [%s]' % e)
        traceback.print_exc()
        return make_response(jsonify({'message': 'Not found ' + str(e)}), 404)
    except ex.TccHeuristicException as e:
        logger.error('Trip Booking confirmation failed with exception [%s]' % e)
        traceback.print_exc()
        return make_response(jsonify({'message': 'Not found '+str(e)}), 409)
    except Exception as e:
        logger.error('Trip Booking confirmation failed with exception [%s]' % e)
        traceback.print_exc()
        return make_response(jsonify({'message': str(e)}), 500)


@app.route('/travel-agent/api/cancel/<trip_booking_id>', methods=['DELETE'])
def do_trip_cancel(trip_booking_id):
    logger.info("Received cancel trip booking request")
    try:
        trip_booking_record = history.get(trip_booking_id)
        if trip_booking_record is None:
            return make_response(jsonify({'response': 'bookingId not found'}), 404)
        participants = get_travel_participants(trip_booking_record)
        cancel_response = TCCClient.CancelTCCByParticipants(request.headers, participants)
        logger.info(cancel_response)
        if cancel_response.status_code == 200:
            trip_booking_record.status = BookingStatus.CANCELLED.value
            trip_booking_record.message = "Booking cancelled successfully"
            history.set(trip_booking_id, trip_booking_record)
            return make_response(json.loads(json.dumps(history.get(trip_booking_id), cls=bh.BookingHistoryEncoder)), 200)
        else:
            trip_booking_record.status = BookingStatus.FAILED.value
            trip_booking_record.message = "Booking cancellation failed "+ str(cancel_response)
            history.set(trip_booking_id, trip_booking_record)
            return make_response(json.loads(json.dumps(history.get(trip_booking_id), cls=bh.BookingHistoryEncoder)), 500)
    except (ex.InternalServerErrorException, ex.TccException) as e:
        logger.error('Trip Booking cancellation failed with exception [%s]' % e)
        traceback.print_exc()
        return make_response(jsonify({'message': 'server error'+str(e)}), 500)
    except ex.TccUnknownTransactionException as e:
        logger.error('Trip Booking cancellation failed with exception [%s]' % e)
        traceback.print_exc()
        return make_response(jsonify({'message': 'Not found '+str(e)}), 404)
    except ex.TccHeuristicException as e:
        logger.error('Trip Booking cancellation failed with exception [%s]' % e)
        traceback.print_exc()
        return make_response(jsonify({'message': 'Not found '+str(e)}), 409)
    except Exception as e:
        logger.error('Trip Booking cancellation failed with exception [%s]' % e)
        traceback.print_exc()
        return make_response(jsonify({'message': str(e)}), 500)


def get_travel_participants(trip_booking_record):
    tcc_participants = []
    tcc_participants.append(TccParticipant(trip_booking_record.flightBooking.bookingUri, trip_booking_record.flightBooking.expires))
    tcc_participants.append(TccParticipant(trip_booking_record.hotelBooking.bookingUri, trip_booking_record.hotelBooking.expires))
    return tcc_participants


@app.route('/travel-agent/api/bookings', methods=['GET'])
def get_all_bookings():
    logger.info("In get all bookings.")
    return make_response(json.loads((json.dumps(history.getAll(), cls=bh.BookingHistoryEncoder))), 200)


@app.route('/travel-agent/api/bookings/<trip_booking_id>', methods=['GET'])
def get_booking(trip_booking_id):
    logger.info("In get booking. Booking ID is [ " + trip_booking_id + " ]")
    if history.get(trip_booking_id) is None:
        return make_response(jsonify({'response': 'bookingId not found'}), 404)
    return make_response(json.loads(json.dumps(history.get(trip_booking_id), cls=bh.BookingHistoryEncoder)), 200)


if __name__ == '__main__':
    logger.info("travel agent booking Service on port:" + str(service_port))
    app.run(host='0.0.0.0', port=int(service_port))
