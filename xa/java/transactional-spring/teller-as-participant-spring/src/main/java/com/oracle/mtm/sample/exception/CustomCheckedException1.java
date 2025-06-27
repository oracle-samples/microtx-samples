package com.oracle.mtm.sample.exception;

/**
 * @author Bharath.MC
 */
public class CustomCheckedException1 extends Exception{

    public CustomCheckedException1(String msg){
        super("Custom Exception "+msg);
    }
}
