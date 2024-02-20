package com.example.tripmanagersb.service;

import java.util.concurrent.CompletableFuture;

/**
 * Booking Service interface which defines booking of Hotel and Flight participants which executes asynchronously
 */
public interface BookingService {
    CompletableFuture bookHotel(String name, String id);
    CompletableFuture bookFlight(String flightNumber, String id);
}
