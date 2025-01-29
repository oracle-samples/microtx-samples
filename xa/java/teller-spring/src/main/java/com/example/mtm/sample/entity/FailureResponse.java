package com.example.mtm.sample.entity;

public class FailureResponse {

    String errorMessage;

    public FailureResponse(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    @Override
    public String toString() {
        return "FailureResponse{" +
                "errorMessage='" + errorMessage + '\'' +
                '}';
    }
}
