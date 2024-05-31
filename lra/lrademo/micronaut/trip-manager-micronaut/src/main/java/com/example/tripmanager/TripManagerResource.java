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
import com.example.tripmanager.model.BookingResponse;
import com.oracle.microtx.lra.annotation.AfterLRA;
import com.oracle.microtx.lra.annotation.LRA;
import io.micronaut.context.annotation.Property;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import io.micronaut.http.client.HttpClient;
import io.micronaut.http.uri.UriBuilder;
import io.micronaut.runtime.http.scope.RequestScope;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static com.oracle.microtx.lra.annotation.LRA.*;

@Controller("/trip-service/api")
@RequestScope
@Introspected
public class TripManagerResource {
    private static final String ORACLE_TMM_TX_TOKEN = "Oracle-Tmm-Tx-Token";

    @Inject
    private TripService service;

    @Property(name = "hotel.service.url")
    private String hotelServiceUri;

    @Property(name = "flight.service.url")
    private String flightServiceUri;

    /**
     * RestTemplate must be autowired because then only the client Interceptor will be able to intercept
     * Interceptors are specific to the restTemplate
     */
    @Inject
    HttpClient httpClient;

    private static final Logger LOG = LoggerFactory.getLogger(TripManagerResource.class);

    @Post(uri = "/trip/", consumes = MediaType.APPLICATION_JSON)
    @LRA(value = LRA.Type.REQUIRES_NEW, end = false)
    public HttpResponse<?> bookTrip(@QueryValue(value = "hotelName", defaultValue = "TheGrand") String hotelName,
                                    @QueryValue(value = "flightNumber", defaultValue = "A123") String flightNumber,
                                    @Header(LRA_HTTP_CONTEXT_HEADER) String lraId,
                                    @Nullable @Header(ORACLE_TMM_TX_TOKEN) String oracleTmmTxToken){

        LOG.info("Started new LRA " + lraId);

        Booking tripBooking = null;
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));
        try {
            LOG.info("Calling LRA participants Hotel booking and Flight booking sequentially");
            Booking flightBooking = null;
            Booking hotelBooking = bookHotel(hotelName, bookingId);
            if (hotelBooking != null && hotelBooking.getStatus() != Booking.BookingStatus.FAILED) {
                flightBooking = bookFlight(flightNumber, bookingId);
            }
            tripBooking = new Booking(bookingId, "Trip", "Trip", hotelBooking, flightBooking);
            service.saveProvisionalBooking(tripBooking);

            return (oracleTmmTxToken != null) ? HttpResponse.ok().header(ORACLE_TMM_TX_TOKEN, oracleTmmTxToken).body(tripBooking) :
                    HttpResponse.ok().body(tripBooking);
        } catch (BookingException e) {
            LOG.error("Booking failed", e);
            return (oracleTmmTxToken != null) ? HttpResponse.serverError().header(ORACLE_TMM_TX_TOKEN, oracleTmmTxToken)
                    .body(tripBooking) : HttpResponse.serverError().body(e.getMessage());
        }
    }

    @Get(uri = "/trip/{bookingId}")
    public HttpResponse<?> getBooking(@PathVariable("bookingId") String bookingId) {
        return HttpResponse.ok(service.get(bookingId));
    }

    @Put(uri = "/trip/{bookingId}", consumes = MediaType.TEXT_PLAIN)
    @LRA(value = LRA.Type.MANDATORY, end = true)
    public HttpResponse<?> confirmTrip(@PathVariable String bookingId){
        LOG.info("Received Confirmation for trip booking with Id : " + bookingId);
        Booking tripBooking = service.get(bookingId);
        if (tripBooking.getStatus() == Booking.BookingStatus.CANCEL_REQUESTED) {
            return HttpResponse.status(HttpStatus.BAD_REQUEST, "Cannot confirm a trip booking that needs to be cancelled");
        }
        return HttpResponse.ok(new BookingResponse("Confirm booking requested"));
    }

    @Delete(uri = "/trip/{bookingId}", consumes = MediaType.TEXT_PLAIN)
    @LRA(value = LRA.Type.MANDATORY, end = true, cancelOn = HttpStatus.OK)
    public HttpResponse<?> cancelTrip(@PathVariable String bookingId){
        LOG.info("Received Cancellation for trip booking with Id : " + bookingId);
        return HttpResponse.ok(new BookingResponse("Cancel booking requested"));
    }

    @Get(uri = "/trip")
    public HttpResponse<?> getAll() {
        return HttpResponse.ok(service.getAll());
    }

    @Put(uri = "/after", consumes = MediaType.TEXT_PLAIN, produces = MediaType.TEXT_PLAIN)
    @AfterLRA
    public HttpResponse<?> afterLra(@Header(LRA_HTTP_ENDED_CONTEXT_HEADER) String lraId, @Body String status){
        String bookingId = new String(Base64.getEncoder().encode(lraId.getBytes(StandardCharsets.UTF_8)));
        LOG.info("After LRA Called : " + lraId);
        LOG.info("Final LRA Status : " + status);
        Booking tripBooking = service.get(bookingId);
        if (tripBooking != null) {
            // Fetch the final status of hotel and flight booking
            service.mergeAssociateBookingDetails(tripBooking, getHotelTarget(), getFlightTarget());
        }
        // Clean up of resources held by this LRA
        return HttpResponse.ok();
    }

    private Booking bookHotel(String name, String id) {
        LOG.info("Calling Hotel Service to book hotel with booking Id : " + id);

        URI hotelUri = UriBuilder.of(hotelServiceUri)
                .queryParam("hotelName", name)
                .build();

        HttpRequest<?> request = HttpRequest.POST(hotelUri, null)
                .accept(MediaType.APPLICATION_JSON_TYPE)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED);

        Booking hotelBooking = null;
        try {
            HttpResponse<Booking> response = httpClient.toBlocking().exchange(request, Booking.class);
            hotelBooking = response.body();
            LOG.info(String.format("Hotel booking %s with booking Id : %s", (hotelBooking.getStatus() == Booking.BookingStatus.FAILED ? "FAILED" : "SUCCESSFUL"), hotelBooking.getId()));
        } catch (Exception ex) {
            LOG.error("Hotel booking FAILED with error", ex);
        }
        assert hotelBooking != null;
        return hotelBooking;
    }

    private Booking bookFlight(String flightNumber, String id) {
        LOG.info("Calling Flight Service to book flight with booking Id : " + id);

        URI flightUri = UriBuilder.of(flightServiceUri)
                .queryParam("flightNumber", flightNumber)
                .build();

        HttpRequest<?> request = HttpRequest.POST(flightUri, null)
                    .accept(MediaType.APPLICATION_JSON_TYPE)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED);

        Booking flightBooking = null;
        try {
            HttpResponse<Booking> response = httpClient.toBlocking().exchange(request, Booking.class);
            flightBooking = response.body();
            LOG.info(String.format("Flight booking %s with booking Id : %s", (flightBooking.getStatus() == Booking.BookingStatus.FAILED ? "FAILED" : "SUCCESSFUL"), flightBooking.getId()));
        } catch (Exception ex) {
            LOG.error("Flight booking FAILED with error", ex);
        }
        assert flightBooking != null;
        return flightBooking;
    }

    private UriBuilder getHotelTarget(){
        return UriBuilder.of(URI.create(hotelServiceUri));
    }

    private UriBuilder getFlightTarget(){
        return UriBuilder.of(URI.create(flightServiceUri));
    }
}
