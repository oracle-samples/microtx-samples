package com.example.mtm.sample.entity;

public class TransferResponse {
    String message;

    public TransferResponse(String message) {
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
        return "TransferResponse{" +
                "message='" + message + '\'' +
                '}';
    }
}