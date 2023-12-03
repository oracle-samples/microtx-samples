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
import { randomUUID } from 'crypto';
import { NextFunction, request, Request, Response, Router } from 'express';
const axios = require('axios').default;
import asyncHandler from 'express-async-handler';
import { TCCConfig, ConfirmTCC, CancelTCC, TccParticipant , ConfirmTCCByParticipants , CancelTCCByParticipants } from 'tmmlib-node/tcc/tcc';
import { HttpMethod, TrmConfig } from 'tmmlib-node/util/trmutils';

// Init Router
const travelAgentSvcRouter = Router();
const HOTEL_BOOKING_SVC_ENDPOINT = process.env.HOTEL_SERVICE_URL || "http://localhost:8081/api";
const FLIGHT_BOOKING_SVC_ENDPOINT = process.env.FLIGHT_SERVICE_URL || "http://localhost:8082/api";


// Initialize TMM library properties
TrmConfig.init('./tmm.properties');

// Intialize TMM TCC configurations
const tccConfig: TCCConfig = new TCCConfig("/bookings", travelAgentSvcRouter, HttpMethod.POST, 30);

const tccConfigForTwoStep: TCCConfig = new TCCConfig("/bookings/reserve", travelAgentSvcRouter, HttpMethod.POST, 30);

//Intialize the transaction booking hashmap
type TransactionRecord={
    tripBookingId:string,
    status:BookingStatus,    
    message:string,    
    hotelBooking:string,
    flightBooking:string,
}

enum BookingStatus {
    RESERVED="RESERVED",
    CONFIRMED="CONFIRMED",
    CANCELLED="CANCELLED",
    FAILED="FAILED"
}

const bookings = new Map<string, TransactionRecord>();

travelAgentSvcRouter.get('/bookings',asyncHandler(async (req: Request, resp: Response) => {
    getall(req, resp); //business logic
}));

travelAgentSvcRouter.get('/bookings/:bookingId',asyncHandler(async (req: Request, resp: Response) => {
    getbooking(req, resp); //business logic
}));

function getbooking(req: Request, resp: Response) {
    console.log(req.params.bookingId)
    const booking = bookings.get(req.params.bookingId);
    if (!booking) {
        console.log(`Booking not found, Id: ${req.params.bookingId}`);
        return resp.status(404).send();
    }
    resp.status(200).type('application/json').send(JSON.stringify(booking));
}


function getall(req: Request, resp: Response) {
    console.log(`All the previous Bookings`);
    const result = Array.from(bookings.values())
    // const result = Object.keys(bookings);
    // console.log(result);
    resp.status(200).type('application/json').send(JSON.stringify(result));
}

travelAgentSvcRouter.post('/bookings', asyncHandler(async (req: Request, resp: Response, next: NextFunction) => {
    console.log("Node.js TRM TCC Client Confirm TCC Demo: start transaction");
    const tripBookingId:string = randomUUID();
    let transactionRecord:TransactionRecord ={
        tripBookingId:tripBookingId,
        status:BookingStatus.CANCELLED,
        message:"Booking Cancelled",
        hotelBooking:"No Booking",
        flightBooking:"No Booking"
    }
    const hotelName: string = req.query.hotelName as string || "Hotel-01";
    const flightNumber: string = req.query.flightNumber as string || "Flight-01";
    try {
        const hotel: string = await bookHotel(hotelName);
        const flight: string = await bookFlight(flightNumber); 
        let hotelResponse  = JSON.parse(hotel);
        let flightResponse = JSON.parse(flight);
        transactionRecord.hotelBooking = hotelResponse 
        transactionRecord.flightBooking = flightResponse
    
        if (req.query.cancel == 'true') {
            // Call TCCLib cancel tcc method to cancel the transaction
            await CancelTCC(req.headers);
            transactionRecord.status=BookingStatus.CANCELLED;
            transactionRecord.message="Trip Booking has been cancelled"
            bookings.set(tripBookingId,transactionRecord);
            resp.status(200).send(transactionRecord);
        } else {
            // Call TCCLib confirm tcc method to confirm the transaction
            let confirmResponse = await ConfirmTCC(req.headers);
            console.log("confirmResponse="+confirmResponse);
            transactionRecord.status=BookingStatus.CONFIRMED;
            transactionRecord.message="Successfully booked the trip"
            bookings.set(tripBookingId,transactionRecord);
            resp.status(200).send(transactionRecord);
        }
    }
    catch (e) {
        console.log("Booking Failed: ", e);
        transactionRecord.status=BookingStatus.FAILED;
        transactionRecord.message="Booking failed, exception occurred. "+e;
        bookings.set(tripBookingId,transactionRecord);
        resp.status(500).send(transactionRecord);
    }
}));

travelAgentSvcRouter.post('/bookings/reserve', asyncHandler(async (req: Request, resp: Response, next: NextFunction) => {
    console.log("Node.js MicroTx TCC trip reservations");
    const tripBookingId:string = randomUUID();
    let transactionRecord:TransactionRecord ={
        tripBookingId:tripBookingId,
        status:BookingStatus.CANCELLED,
        message:"Booking Cancelled",
        hotelBooking:"No Booking",
        flightBooking:"No Booking"
    }
    const hotelName: string = req.query.hotelName as string || "Hotel-01";
    const flightNumber: string = req.query.flightNumber as string || "Flight-01";
    try {
        const hotel: string = await bookHotel(hotelName);
        const flight: string = await bookFlight(flightNumber); 
        let hotelResponse  = JSON.parse(hotel);
        let flightResponse = JSON.parse(flight);
        transactionRecord.hotelBooking=hotelResponse
        transactionRecord.flightBooking=flightResponse
        bookings.set(tripBookingId,transactionRecord);
        transactionRecord.status=BookingStatus.RESERVED;
        transactionRecord.message="Trip Reservation was successful"
        resp.status(200).send(transactionRecord);
    }
    catch (error: any) {
        console.log("Trip Reservation failed : ", error);
        transactionRecord.status=BookingStatus.FAILED;
        transactionRecord.message="Trip Reservation failed : "+error;
        bookings.set(tripBookingId,transactionRecord);
        resp.status(500).send(transactionRecord);
    }
}));

travelAgentSvcRouter.put('/confirm/:tripBookingId', asyncHandler(async (req: Request, resp: Response, next: NextFunction) => {
    console.log("Node.js MicroTx TCC Confirm reservations");
    const confirmTripBookingId : string = req.params.tripBookingId as string;
    console.log("confirmTripBookingId"+confirmTripBookingId);
    console.log("req headers "+req.headers["link"]);
    let tripBookingRecord = bookings.get(confirmTripBookingId) as TransactionRecord;
    try {
        let participants = getTravelParticipants(tripBookingRecord);
        await ConfirmTCCByParticipants(req.headers, participants);

        tripBookingRecord.status=BookingStatus.CONFIRMED;
        tripBookingRecord.message="Booking confirmed Successfully"
        resp.status(200).send(tripBookingRecord);
    }
    catch (e) {
        console.log("Trip Booking confirmation failed: ", e);
        tripBookingRecord.status=BookingStatus.FAILED;
        tripBookingRecord.message="Trip Booking confirmation failed:  "+e;
        bookings.set(confirmTripBookingId,tripBookingRecord);
        resp.status(500).send(tripBookingRecord);
    }
}));

travelAgentSvcRouter.delete('/cancel/:tripBookingId', asyncHandler(async (req: Request, resp: Response, next: NextFunction) => {
    const cancelTripBookingId : string = req.params.tripBookingId as string;
    let tripBookingRecord = bookings.get(cancelTripBookingId) as TransactionRecord;
    try {
        let participants = getTravelParticipants(tripBookingRecord);
        await CancelTCCByParticipants(req.headers, participants);

        tripBookingRecord.status=BookingStatus.CANCELLED;
        tripBookingRecord.message="Booking cancelled Successfully"
        resp.status(200).send(tripBookingRecord);
    }
    catch (e) {
        console.log("Cancellation of booking failed : ", e);
        tripBookingRecord.status=BookingStatus.FAILED;
        tripBookingRecord.message="Cancellation of booking failed as exception occurred. "+e;
        bookings.set(cancelTripBookingId,tripBookingRecord);
        resp.status(500).send(tripBookingRecord);
    }
}));

function getTravelParticipants(transactionRecord: TransactionRecord) {
    let participants : TccParticipant[] = [];
    var hotelBooking = JSON.parse(JSON.stringify(transactionRecord.hotelBooking));
    var flightBooking = JSON.parse(JSON.stringify(transactionRecord.flightBooking));
    participants.push(new TccParticipant(hotelBooking.bookingUri, hotelBooking.expires));
    participants.push(new TccParticipant(flightBooking.bookingUri, flightBooking.expires));
    return participants;
}


async function bookHotel(hotelName: string): Promise<string> {
    console.log(`Hotel Booking In progress`);
    let svcEndpoint = HOTEL_BOOKING_SVC_ENDPOINT + "/bookings?hotelName=" + hotelName;
    let hotelbookingResponse :string = JSON.stringify({Error:"Error in Booking Hotel()"});
    try {
        let resp = await axios({
            method: 'post',
            url: svcEndpoint,
        });
        if (resp.status != 200 && resp.status != 201) {
            throw new Error("Failed To Book Hotel");
        }
        console.log(`Hotel booking: ${JSON.stringify(resp.data)}`);
        hotelbookingResponse = JSON.stringify(resp.data);
    } catch (error : any) {
        console.log("Error in Booking Hotel(): ", error.response.data.message);
        throw new Error(error.response.data.message);
    }
    return hotelbookingResponse;
}

async function bookFlight(flightNumber : string): Promise<string> {
    console.log(`Flight Booking In progress`);
    let svcEndpoint = FLIGHT_BOOKING_SVC_ENDPOINT + "/bookings?flightNumber=" + flightNumber;
    let FlightbookingResponse:string = JSON.stringify({Error:"Error in Booking Flight()"});
    try {
        let resp = await axios({
            method: 'post',
            url: svcEndpoint
        });
        if (resp.status != 200 && resp.status != 201) {
            throw new Error("Failed To Book Flight");
        }
        console.log(`Flight booking: ${JSON.stringify(resp.data)}`);
        FlightbookingResponse = JSON.stringify(resp.data);
    } catch (error: any) {
        console.log("Error in Booking Flight(): ", error.response.data.message);
        throw new Error(error.response.data.message);
    }
    return FlightbookingResponse;
}

/******************************************************************************
 *                                     Export
 ******************************************************************************/
export default travelAgentSvcRouter;

