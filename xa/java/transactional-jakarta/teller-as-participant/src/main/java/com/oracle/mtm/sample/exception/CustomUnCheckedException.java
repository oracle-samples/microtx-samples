package com.oracle.mtm.sample.exception;

/**
 * @author Bharath.MC
 */
public class CustomUnCheckedException extends RuntimeException{

    public CustomUnCheckedException(String message){
        super(message);
    }
}
