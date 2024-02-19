package com.example.tripmanagersb.model;

public class BookingResponse {
    String message;

    public BookingResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public String toString() {
        return "BookingResponse{" +
                "message='" + message + '\'' +
                '}';
    }
}
