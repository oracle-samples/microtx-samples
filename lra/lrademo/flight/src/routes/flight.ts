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
import { Request, Response, Router } from 'express';
import { getLRAId, LRA, LRAConfig, LRAType, ParticipantStatus } from "tmmlib-node/lra/lra";
import { TrmConfig } from 'tmmlib-node/util/trmutils';
import { Booking, BookingStatus, getConfirmedBookingsCount, setMaxConfirmedBooking } from "../booking";
import { bookingMap, MAX_CONFIRMED_BOOKING  } from '../booking';

// Init Router
const flightSvcRouter = Router();

// Transaction coordinator configuration initialization 
TrmConfig.init('./tmm.properties');

// Get the LRA coordinator URL
const lraCoordinateUrl = process.env.ORACLE_TMM_TCS_URL || "http://localhost:9000/api/v1/lra-coordinator"
//Step to setup and initiate LRA participation
const lra: LRA = new LRA("/flight", LRAType.MANDATORY);
lra.end = false;
lra.timeLimitInMilliSeconds = 100000;
new LRAConfig(lraCoordinateUrl, flightSvcRouter, "/flightService/api",
    lra, "/complete", "/compensate", "/status", "/after", "", "", "");

flightSvcRouter.post('/flight', (req, resp) => {
    var booking = checkAndBookFlight(req, resp); //business logic
    if (!booking) {
        resp.status(500).send("Flight booking failed");
    }
    resp.type('application/json').send(JSON.stringify(booking));
});

flightSvcRouter.get('/flight/:bookingId', (req, resp) => {
    const bookingId = req.params.bookingId;
    console.log(`Get Booking details called for: ${bookingId}`);
    let booking = bookingMap.get(bookingId);
    if (!booking) {
        resp.status(404).send("Flight Booking not found");
    } else {
        resp.type('application/json').send(JSON.stringify(booking));
    }
});

flightSvcRouter.put('/complete', async (req, resp) => {
    var lraId = getLRAId(req, resp);
    if (!lraId) {
        resp.status(400).send("No LRA associated");
        return;
    }
    console.log(`FlightServiceResource complete() called for LRA : [${lraId}]`);
    let booking: Booking = bookingMap.get(lraId) as Booking;
    if (!booking) {
        return resp.status(404).send("Flight Booking not found");
    } 
    if (booking.status == BookingStatus.PROVISIONAL) {
        booking.status = BookingStatus.CONFIRMED;
        return resp.type('application/json').send(ParticipantStatus.Completed);
    }
    booking.status = BookingStatus.FAILED;
    return resp.type('application/json').send(ParticipantStatus.FailedToComplete);    
    
});

flightSvcRouter.put('/compensate', async (req, resp) => {
    var lraId = getLRAId(req, resp);
    if (!lraId) {
        resp.status(400).send("No LRA associated");
        return;
    }
    console.log(`FlightServiceResource compensate() called for LRA : [${lraId}]`);
    let booking: Booking = bookingMap.get(lraId) as Booking;
    if (booking == null) {
        return resp.status(404).send("Flight Booking not found");
    } 
    if (booking.status == BookingStatus.PROVISIONAL) {
        booking.status = BookingStatus.CANCELLED;
        return resp.type('application/json').send(ParticipantStatus.Compensated);
    }
    booking.status = BookingStatus.FAILED;
    return resp.type('application/json').send(ParticipantStatus.FailedToComplete);  
});

flightSvcRouter.get('/status', (req, resp) => {
    var lraId = getLRAId(req, resp);
    if (!lraId) {
        return resp.status(400).send("No LRA associated");
    }
    console.log(`FlightServiceResource status() called for LRA : [${lraId}]`);
    let booking: Booking = bookingMap.get(lraId) as Booking;
    if (booking == null) {
        return resp.status(404).send("Flight Booking not found");
    } 
    if(booking.status == BookingStatus.CONFIRMED){
        return resp.type('text/plain').send(ParticipantStatus.Completed);
    }
    return resp.type('text/plain').send(ParticipantStatus.Compensated);
});

flightSvcRouter.put('/after', (req, resp) => {
    // Clean up resource held by this LRA
    // Finalise the status of the LRA
    var lraId = getLRAId(req, resp);
    console.log(`FlightServiceResource after() called for LRA : [${lraId}]`);
    const status = req.body;
    console.log(`LRA [${lraId}] final status: ${status}`);
    resp.status(200).send();
});

flightSvcRouter.delete('/flight/:bookingId', (req, resp) => {
    let bookingId = req.params.bookingId;
    console.log(`Delete Booking details called for: ${bookingId}`);
    let booking = bookingMap.get(bookingId);
    if (!booking) {
        resp.status(404).send("Flight Booking not found");
    } else {
        bookingMap.delete(bookingId);
        resp.type('application/json').send(JSON.stringify(booking));
    }
});

flightSvcRouter.get('/flight', (req, resp) => {
    console.log("Get All Flight bookings called");
    let bookings = new Array<Booking>();
    bookingMap.forEach(function (booking) {
        bookings.push(booking);
    });
    resp.type('application/json').send(JSON.stringify(bookings));
});

flightSvcRouter.put('/maxbookings', (req, resp) => {
    let num = req.query.count;
    console.log(`Set Max Booking Count : ${num}`);
    if (typeof num == 'string') {
        setMaxConfirmedBooking(parseInt(num, 10));
    }
    resp.status(200).type('text/plain').send(MAX_CONFIRMED_BOOKING.toString());
});

function checkAndBookFlight(req: Request, resp: Response) {
    var lraId = getLRAId(req, resp);
    if (!lraId) {
        return null;
    }
    let booking
    let flightNum = req.query.flightNumber?.toString();
    if (flightNum) {
        booking = new Booking(lraId, flightNum, "Flight");
        bookingMap.set(lraId, booking);
        if (getConfirmedBookingsCount(bookingMap) >= MAX_CONFIRMED_BOOKING) {
            booking.status = BookingStatus.FAILED;
            console.log(`Flight Booking failed: ${JSON.stringify(booking)}`);
        } else {
            console.log(`Flight Booking created: ${JSON.stringify(booking)}`);
        }
    }
    return booking;
}

/******************************************************************************
 *                                     Export
 ******************************************************************************/


export default flightSvcRouter;


