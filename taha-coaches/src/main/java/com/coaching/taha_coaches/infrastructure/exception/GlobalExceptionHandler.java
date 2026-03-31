package com.coaching.taha_coaches.infrastructure.exception;

import com.coaching.taha_coaches.domain.reservation.ReservationNotCancellableException;
import com.coaching.taha_coaches.domain.reservation.ReservationNotFoundException;
import com.coaching.taha_coaches.domain.reservation.SlotAlreadyBookedException;
import com.coaching.taha_coaches.domain.reservation.SlotNotAvailableException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final MessageSource messageSource;

    public GlobalExceptionHandler(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    /**
     * Resolves a message key using the request's locale (Accept-Language header).
     * Returns the key itself as fallback if the key is not found.
     */
    private String resolve(String key) {
        return messageSource.getMessage(key, null, key, LocaleContextHolder.getLocale());
    }

    /**
     * Shared helper — builds the standard error response body.
     * The frontend receives both:
     *   - "messageKey": the i18n key, so the frontend can look it up itself
     *   - "message":    the already-resolved string, ready to display directly
     */
    private ResponseEntity<Map<String, String>> error(HttpStatus status, RuntimeException ex) {
        String key = ex.getMessage(); // our exceptions store the key as the message
        return ResponseEntity.status(status)
                .body(Map.of("messageKey", key, "message", resolve(key)));
    }

    @ExceptionHandler(SlotNotAvailableException.class)
    public ResponseEntity<Map<String, String>> handleSlotNotAvailable(SlotNotAvailableException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("messageKey", ex.getMessage(), "message", resolve(ex.getMessage())));
    }

    @ExceptionHandler(SlotAlreadyBookedException.class)
    public ResponseEntity<Map<String, String>> handleSlotAlreadyBooked(SlotAlreadyBookedException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("messageKey", ex.getMessage(), "message", resolve(ex.getMessage())));
    }

    @ExceptionHandler(ReservationNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(ReservationNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, ex);
    }

    @ExceptionHandler(ReservationNotCancellableException.class)
    public ResponseEntity<Map<String, String>> handleNotCancellable(ReservationNotCancellableException ex) {
        return error(HttpStatus.CONFLICT, ex);
    }
}