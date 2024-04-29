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
package com.example;

import com.example.model.Booking;
import com.oracle.microtx.lra.annotation.*;
import com.oracle.microtx.lra.annotation.Status;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import io.micronaut.runtime.http.scope.RequestScope;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static com.oracle.microtx.lra.annotation.LRA.*;

@Controller("/hotelService/api")
@RequestScope
@Introspected
public class HotelResource {
    private static final Logger LOG = LoggerFactory.getLogger(HotelResource.class);

    @Inject
    HotelService hotelService;

    @Post(uri = "/hotel", consumes = MediaType.APPLICATION_FORM_URLENCODED)
    @LRA(value = LRA.Type.MANDATORY, end = false)
    public HttpResponse<?> bookRoom(@Header(LRA_HTTP_CONTEXT_HEADER) String lraId,
                                    @QueryValue(value = "hotelName") String hotelName){
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));
        Booking booking = hotelService.book(bookingId, hotelName);
        LOG.info("Hotel Booking created: " + booking);
        return HttpResponse.ok(booking);
    }

    @Put(uri = "/complete", consumes = MediaType.TEXT_PLAIN, produces = MediaType.TEXT_PLAIN)
    @Complete
    public HttpResponse<?> completeWork(@Header(LRA_HTTP_CONTEXT_HEADER) String lraId){
        LOG.info("HotelServiceResource complete() called for LRA : " + lraId);
        // Business logic to complete the work related to this LRA
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));
        Booking booking = hotelService.get(bookingId);
        if(booking == null){
            return HttpResponse.notFound().body("Hotel booking not found");
        }
        if (booking.getStatus() == Booking.BookingStatus.PROVISIONAL) {
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
            return HttpResponse.ok(ParticipantStatus.Completed.name());
        }
        booking.setStatus(Booking.BookingStatus.FAILED);
        return HttpResponse.ok(ParticipantStatus.FailedToComplete.name());
    }

    @Put(uri = "/compensate", consumes = MediaType.TEXT_PLAIN, produces = MediaType.TEXT_PLAIN)
    @Compensate
    public HttpResponse<?> compensateWork(@Header(LRA_HTTP_CONTEXT_HEADER) String lraId){
        LOG.info("HotelServiceResource compensate() called for LRA : " + lraId);
        // Business logic to compensate the work related to this LRA
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));
        Booking booking = hotelService.get(bookingId);
        if(booking == null){
            return HttpResponse.notFound().body("Hotel booking not found");
        }
        if (booking.getStatus() == Booking.BookingStatus.PROVISIONAL) {
            booking.setStatus(Booking.BookingStatus.CANCELLED);
            return HttpResponse.ok(ParticipantStatus.Compensated.name());
        }
        booking.setStatus(Booking.BookingStatus.FAILED);
        return HttpResponse.ok(ParticipantStatus.FailedToCompensate.name());
    }

    @Delete(uri = "/forget", consumes = MediaType.TEXT_PLAIN, produces = MediaType.TEXT_PLAIN)
    @Forget
    public HttpResponse<?> forget(@Header(LRA_HTTP_CONTEXT_HEADER) String lraId, @Nullable @Header(LRA_HTTP_PARENT_CONTEXT_HEADER) String parentLraID){
        LOG.info("Forget called");
        if(lraId == null){
            return  HttpResponse.badRequest().body("LRA header not present");
        }
        if(parentLraID != null){
            LOG.info("Parent Lra is active");
            //If parent called complete then this gets invoked in child if it got completed. In this we set the work of child to completed if it's provisionally set.
            //Then we clean up the held resources by this(child).
        }
        return HttpResponse.ok("Cleaned Up");
    }

    @Get(uri = "/status")
    @Status
    public HttpResponse<?> status(@Header(LRA_HTTP_CONTEXT_HEADER) String lraId, @Nullable @Header(LRA_HTTP_PARENT_CONTEXT_HEADER) String parentLRA){
        LOG.info("HotelServiceResource status() called for LRA : " + lraId);
        if (parentLRA != null) { // is the context nested
            // code which is sensitive to executing with a nested context goes here
        }
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));
        Booking.BookingStatus status = hotelService.get(bookingId).getStatus();
        // Business logic (provided by the business developer)
        if(status == Booking.BookingStatus.CONFIRMED) {
            return HttpResponse.ok(ParticipantStatus.Completed);
        }
        return HttpResponse.ok(ParticipantStatus.Compensated);
    }

    @Put(uri = "/after", consumes = MediaType.TEXT_PLAIN, produces = MediaType.TEXT_PLAIN)
    @AfterLRA
    public HttpResponse<?> after(@Header(LRA_HTTP_ENDED_CONTEXT_HEADER) String lraId, @Body String status){
        LOG.info("After LRA Called : " + lraId);
        LOG.info("Final LRA Status : " + status);
        // Clean up of resources held by this LRA
        return HttpResponse.ok();
    }

    @Put(uri = "/leave", consumes = MediaType.TEXT_PLAIN, produces = MediaType.TEXT_PLAIN)
    @Leave
    public HttpResponse<?> leave(@Header(LRA_HTTP_CONTEXT_HEADER) String lraId){
        LOG.info("Leave called");
        if(lraId == null){
            return HttpResponse.badRequest().body("LRA header not present");
        }
        return HttpResponse.ok("Left LRA");
    }

    @Get(uri = "/hotel/{bookingId}")
    public HttpResponse<?> getBooking(@PathVariable("bookingId") String bookingId) {
        LOG.info("Get Hotel Booking : " + bookingId);
        return HttpResponse.ok(hotelService.get(bookingId));
    }

    @Get(uri = "/hotel")
    public HttpResponse<?> getAll(){
        LOG.info("Get All Hotel bookings");
        return HttpResponse.ok(hotelService.getAll());
    }

    @Put(uri = "/maxbookings", consumes = MediaType.APPLICATION_FORM_URLENCODED, produces = MediaType.TEXT_PLAIN)
    public HttpResponse<?> setMaxBookingCount(@QueryValue(value = "count") Integer maxBookingCount) {
        HotelService.MAX_BOOKING = maxBookingCount;
        LOG.info("Set Max Hotel Booking Count: " + maxBookingCount);
        return HttpResponse.ok(maxBookingCount);
    }
}
