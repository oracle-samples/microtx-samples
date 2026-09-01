package com.oracle.workflow.samples.notification_service.txeventq;

public record TxEventQueueMetadata(
        String queueName,
        String consumerName) {
}
