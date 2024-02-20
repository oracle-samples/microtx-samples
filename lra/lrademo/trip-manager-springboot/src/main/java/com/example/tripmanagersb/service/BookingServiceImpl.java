package com.example.tripmanagersb.service;

import com.example.tripmanagersb.model.Booking;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.concurrent.CompletableFuture;

@Component
public class BookingServiceImpl implements BookingService {

    /**
     * RestTemplate must be autowired because then only the client Interceptor will be able to intercept
     * Interceptors are specific to the restTemplate
     */
    @Autowired
    @Qualifier("MicroTxLRA")
    private RestTemplate restTemplate;

    @Value("${hotel.service.url}")
    private String hotelServiceUri;

    @Value("${flight.service.url}")
    private String flightServiceUri;

    private static final Logger LOG = LoggerFactory.getLogger(BookingServiceImpl.class);

    @Async(value = "taskExecutorForTripBooking")
    @Override
    public CompletableFuture bookHotel(String name, String id) {
        Booking hotelBooking = null;
        LOG.debug("Calling Hotel Service to book hotel with booking Id : " + id);
        URI hotelUri = getHotelTarget()
                .queryParam("hotelName", name)
                .build()
                .toUri();

        hotelBooking = restTemplate.postForEntity(hotelUri, null, Booking.class).getBody();

        assert hotelBooking != null;
        LOG.info(String.format("Hotel booking %s with booking Id : %s", (hotelBooking.getStatus() == Booking.BookingStatus.FAILED ? "FAILED" : "SUCCESSFUL"), hotelBooking.getId()));
        return CompletableFuture.completedFuture(hotelBooking);
    }

    @Async(value = "taskExecutorForTripBooking")
    @Override
    public CompletableFuture bookFlight(String flightNumber, String id) {
        Booking flightBooking = null;
        LOG.debug("Calling Flight Service to book flight with booking Id : " + id);

        URI flightUri = getFlightTarget()
                .queryParam("flightNumber", flightNumber)
                .build()
                .toUri();

        flightBooking = restTemplate.postForEntity(flightUri, null, Booking.class).getBody();

        assert flightBooking != null;
        LOG.info(String.format("Flight booking %s with booking Id : %s", (flightBooking.getStatus() == Booking.BookingStatus.FAILED ? "FAILED" : "SUCCESSFUL"), flightBooking.getId()));
        return CompletableFuture.completedFuture(flightBooking);
    }

    private UriComponentsBuilder getHotelTarget() {
        return UriComponentsBuilder.fromUri(URI.create(hotelServiceUri));
    }

    private UriComponentsBuilder getFlightTarget() {
        return UriComponentsBuilder.fromUri(URI.create(flightServiceUri));
    }
}
