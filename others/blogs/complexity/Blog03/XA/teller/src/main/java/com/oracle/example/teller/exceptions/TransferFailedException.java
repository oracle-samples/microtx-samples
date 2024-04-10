package com.oracle.example.teller.exceptions;

public class TransferFailedException extends Exception {

    public TransferFailedException(String message) {
        super(message);
    }
}
