package com.oracle.workflow.samples.notification_service.txeventq;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;

@RestControllerAdvice
public class TxEventQueueExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(TxEventQueueExceptionHandler.class);

    @ExceptionHandler(TxEventQueueDisabledException.class)
    public ResponseEntity<ApiError> disabled(TxEventQueueDisabledException exception) {
        LOGGER.warn("TxEventQ API request rejected because viewing is disabled.");
        return response(HttpStatus.SERVICE_UNAVAILABLE, exception.getMessage());
    }

    @ExceptionHandler(TxEventQueueConfigurationException.class)
    public ResponseEntity<ApiError> configuration(TxEventQueueConfigurationException exception) {
        LOGGER.warn("TxEventQ API request rejected because its configuration is incomplete or invalid.");
        return response(HttpStatus.SERVICE_UNAVAILABLE, exception.getMessage());
    }

    @ExceptionHandler(TxEventQueueInvalidMessageIdException.class)
    public ResponseEntity<ApiError> invalidMessageId(TxEventQueueInvalidMessageIdException exception) {
        LOGGER.warn("TxEventQ consume request rejected because the message ID is invalid.");
        return response(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(TxEventQueueMessageNotFoundException.class)
    public ResponseEntity<ApiError> messageNotFound(TxEventQueueMessageNotFoundException exception) {
        LOGGER.warn("TxEventQ consume request could not find a pending message for the configured consumer.");
        return response(HttpStatus.CONFLICT, exception.getMessage());
    }

    @ExceptionHandler(TxEventQueueAccessException.class)
    public ResponseEntity<ApiError> access(TxEventQueueAccessException exception) {
        LOGGER.warn("TxEventQ API request failed while accessing Oracle database. See the TxEventQ service error log for diagnostics.");
        return response(HttpStatus.BAD_GATEWAY, exception.getMessage());
    }

    private ResponseEntity<ApiError> response(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(new ApiError(status.value(), message, Instant.now()));
    }

    public record ApiError(int status, String message, Instant timestamp) {
    }
}
