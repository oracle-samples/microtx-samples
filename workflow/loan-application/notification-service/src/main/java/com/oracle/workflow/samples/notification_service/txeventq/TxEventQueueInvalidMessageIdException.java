package com.oracle.workflow.samples.notification_service.txeventq;

public class TxEventQueueInvalidMessageIdException extends RuntimeException {

    public TxEventQueueInvalidMessageIdException() {
        super("messageId must be a 32-character hexadecimal Oracle AQ message ID.");
    }
}
