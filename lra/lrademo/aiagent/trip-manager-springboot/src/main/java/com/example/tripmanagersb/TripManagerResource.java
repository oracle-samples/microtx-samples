package com.example.tripmanagersb;

import com.example.tripmanagersb.model.Booking;
import com.example.tripmanagersb.model.BookingResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;

@RestController
@RequestMapping("/trip-service/api/sync")
public class TripManagerResource {

    @Autowired
    private TripService service;

    @Value("${hotel.service.url}")
    private String hotelServiceUri;

    @Value("${flight.service.url}")
    private String flightServiceUri;

    /**
     * RestTemplate must be autowired because then only the client Interceptor will be able to intercept
     * Interceptors are specific to the restTemplate
     */
    @Autowired
    RestTemplate restTemplate;

    private static final Logger LOG = LoggerFactory.getLogger(TripManagerResource.class);

    @RequestMapping(value = "/trip", method = RequestMethod.POST)
    public ResponseEntity<?> bookTrip(@RequestParam(value = "hotelName", required = false, defaultValue = "TheGrand") String hotelName,
                                      @RequestParam(value = "flightNumber", required = false, defaultValue = "A123") String flightNumber){

        String randomId = UUID.randomUUID().toString();

        Booking tripBooking = null;
        String bookingId = new String(Base64.getEncoder().encode(randomId.getBytes(StandardCharsets.UTF_8)));
        try {
            Booking flightBooking = null;
            Booking hotelBooking = bookHotel(hotelName, bookingId);
            if (hotelBooking.getStatus() != Booking.BookingStatus.FAILED) {
                flightBooking = bookFlight(flightNumber, bookingId);
            }
            tripBooking = new Booking(bookingId, "Trip", "Trip", hotelBooking, flightBooking);
            service.saveProvisionalBooking(tripBooking);

            return ResponseEntity.ok().body(tripBooking);
        } catch (BookingException e) {
            return ResponseEntity.internalServerError().body(tripBooking);
        }
    }

    @RequestMapping(value = "/trip/{bookingId}", method = RequestMethod.GET)
    public ResponseEntity<?> getBooking(@PathVariable("bookingId") String bookingId) {
        return ResponseEntity.ok(service.get(bookingId));
    }

    @RequestMapping(value = "/trip", method = RequestMethod.GET)
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(service.getAll());
    }


    private Booking bookHotel(String name, String id) {
        LOG.info("Calling Hotel Service to book hotel with booking Id : " + id);

        URI hotelUri = getHotelTarget()
                .queryParam("hotelName", name)
                .build()
                .toUri();

        Booking hotelBooking = restTemplate.postForEntity(hotelUri, null, Booking.class).getBody();

        assert hotelBooking != null;
        LOG.info(String.format("Hotel booking %s with booking Id : %s", (hotelBooking.getStatus() == Booking.BookingStatus.FAILED ? "FAILED" : "SUCCESSFUL"), hotelBooking.getId()));
        return hotelBooking;
    }

    private Booking bookFlight(String flightNumber, String id) {
        LOG.info("Calling Flight Service to book flight with booking Id : " + id);

        URI flightUri = getFlightTarget()
                .queryParam("flightNumber", flightNumber)
                .build()
                .toUri();

        Booking flightBooking = restTemplate.postForEntity(flightUri, null, Booking.class).getBody();

        assert flightBooking != null;
        LOG.info(String.format("Flight booking %s with booking Id : %s", (flightBooking.getStatus() == Booking.BookingStatus.FAILED ? "FAILED" : "SUCCESSFUL"), flightBooking.getId()));
        return flightBooking;
    }

    private UriComponentsBuilder getHotelTarget(){
        return UriComponentsBuilder.fromUri(URI.create(hotelServiceUri));
    }

    private UriComponentsBuilder getFlightTarget(){
        return UriComponentsBuilder.fromUri(URI.create(flightServiceUri));
    }
}
