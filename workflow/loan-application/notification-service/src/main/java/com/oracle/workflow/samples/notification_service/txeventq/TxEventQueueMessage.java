package com.oracle.workflow.samples.notification_service.txeventq;

import java.time.Instant;

public record TxEventQueueMessage(
        String messageId,
        Instant enqueuedAt,
        String state,
        String consumerName,
        String payload) {
}
