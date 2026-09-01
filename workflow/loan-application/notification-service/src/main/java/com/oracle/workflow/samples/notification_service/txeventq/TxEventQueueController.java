package com.oracle.workflow.samples.notification_service.txeventq;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/txeventq")
public class TxEventQueueController {

    private final TxEventQueueService txEventQueueService;

    public TxEventQueueController(TxEventQueueService txEventQueueService) {
        this.txEventQueueService = txEventQueueService;
    }

    @GetMapping("/messages")
    public List<TxEventQueueMessage> listMessages() {
        return txEventQueueService.listMessages();
    }

    @GetMapping("/metadata")
    public TxEventQueueMetadata metadata() {
        return txEventQueueService.metadata();
    }

    @PostMapping("/messages/{messageId}/consume")
    public ResponseEntity<Void> consumeMessage(@PathVariable String messageId) {
        txEventQueueService.consumeMessage(messageId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
