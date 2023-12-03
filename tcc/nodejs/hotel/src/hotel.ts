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
import asyncHandler from "express-async-handler";
import { HttpMethod, TrmConfig } from "tmmlib-node/util/trmutils";
import { GetTCCId, TCCConfig } from "tmmlib-node/tcc/tcc"
import { port } from "../server"
import { randomUUID } from 'crypto';

type Booking = {
    bookingUri: string;
    startTime: number;
    expires: number;
    bookingId: string;
    name: string;
}

type ErrorResponse = {
    message: string;
}

let curBookingId = 0;
let totalBookingsAllowed = 30;
// Init Router
const hotelSvcRouter = Router();
const bookings = new Map<string, Booking>();
// Initialize TRM library properties
TrmConfig.init('./tmm.properties');
const tccConfig: TCCConfig = new TCCConfig("/bookings", hotelSvcRouter, HttpMethod.POST, 60);

hotelSvcRouter.post('/bookings', asyncHandler(async (req: Request, resp: Response) => {
    dohotelBooking(req, resp); //business logic
}));

hotelSvcRouter.put('/bookings/:bookingId', asyncHandler(async (req: Request, resp: Response) => {
    doConfirmBooking(req, resp); //business logic
}));


hotelSvcRouter.delete('/bookings/:bookingId', asyncHandler(async (req: Request, resp: Response) => {
    doCancelBooking(req, resp); //business logic
}));

function dohotelBooking(req: Request, resp: Response) {
    console.log(`Hotel service booking called with tccId:` + GetTCCId(req.headers));
    const bookingBaseUrl = process.env.BOOKING_BASE_URL || (TrmConfig.callbackUrl ? TrmConfig.callbackUrl + "/api/bookings": `http://localhost:${port}/api/bookings`)
    
    if(curBookingId > totalBookingsAllowed){
        console.log(`Maximum Hotel bookings reached`);
        let responseBody : ErrorResponse = {
            message: "Maximum Hotel bookings reached"
        }
        return resp.status(500).send(JSON.stringify(responseBody));
    }
    const hotelBookingId:string = randomUUID();
    const booking: Booking = {
        bookingUri: `${bookingBaseUrl}/${hotelBookingId}`,
        startTime: Date.now(),
        expires: tccConfig.timeInMilliSeconds,
        bookingId:hotelBookingId,
        name: req.query.hotelName as string
    };
    curBookingId++;
    bookings.set(hotelBookingId, booking);
    tccConfig.addTccParticipant(booking.bookingUri);
    console.log(`Hotel Booking: ${JSON.stringify(booking)}`);
    resp.status(200).type('application/json').send(JSON.stringify(booking));
}

function doConfirmBooking(req: Request, resp: Response) {
    console.log(`Hotel service confirm booking called with tccId:` + GetTCCId(req.headers));
    const booking = bookings.get(req.params.bookingId);
    if (!booking) {
        console.log(`Booking not found, Id: ${req.params.bookingId}`);
        return resp.status(404).send();
    }
    if (Date.now() - booking.startTime > booking.expires) {
        return resp.status(500).send(`Booking expired: ${JSON.stringify(booking)}`)
    }
    console.log(`Hotel booking [ ${req.params.bookingId} ] confirmed with tcc transaction Id:` , GetTCCId(req.headers));
    resp.status(200).send();

}
function doCancelBooking(req: Request, resp: Response) {
    console.log(`Hotel service cancel booking called with tccId:` + GetTCCId(req.headers));
    const booking = bookings.get(req.params.bookingId);
    if (!booking) {
        console.log(`Booking not found, Id: ${req.params.bookingId}`);
        return resp.status(404).send();
    }
    console.log(`Hotel booking [ ${req.params.bookingId} ] cancelled with tcc transaction Id:` , GetTCCId(req.headers));
    resp.status(200).send();

}
/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default hotelSvcRouter;