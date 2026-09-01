package com.oracle.workflow.samples.notification_service.txeventq;

public class TxEventQueueDisabledException extends RuntimeException {

    public TxEventQueueDisabledException() {
        super("TxEventQ viewing is disabled. Set TXEVENTQ_ENABLED=true to enable it.");
    }
}
