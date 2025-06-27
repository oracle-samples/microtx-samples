package com.oracle.mtm.sample.exception;

/**
 * @author Bharath.MC
 */
public class CustomCheckedException2 extends Exception{

    public CustomCheckedException2(String msg){
        super("Custom Exception2 "+msg);
    }
}
