package com.oracle.workflow.samples.notification_service.txeventq;

public class TxEventQueueMessageNotFoundException extends RuntimeException {

    public TxEventQueueMessageNotFoundException(String messageId) {
        super("The message is no longer pending for the configured consumer: " + messageId);
    }
}
