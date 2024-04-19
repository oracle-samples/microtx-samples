package com.oracle.example.department.exception;

public class UnprocessableEntityException extends Exception {
    public UnprocessableEntityException(String message) {
        super(message);
    }
}
