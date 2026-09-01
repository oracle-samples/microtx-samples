package com.oracle.workflow.samples.notification_service.txeventq;

public class TxEventQueueAccessException extends RuntimeException {

    public TxEventQueueAccessException(String message, Throwable cause) {
        super(message, cause);
    }
}
