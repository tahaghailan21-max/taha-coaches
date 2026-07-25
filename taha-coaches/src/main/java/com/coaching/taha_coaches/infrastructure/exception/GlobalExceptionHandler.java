package com.coaching.taha_coaches.infrastructure.exception;

import com.coaching.taha_coaches.domain.availability.exceptions.AvailabilityHasReservationsException;
import com.coaching.taha_coaches.domain.availability.exceptions.AvailabilityOverlapException;
import com.coaching.taha_coaches.domain.reservation.exceptions.ReservationNotApprovableException;
import com.coaching.taha_coaches.domain.reservation.exceptions.ReservationNotCancellableException;
import com.coaching.taha_coaches.domain.reservation.exceptions.ReservationNotFoundException;
import com.coaching.taha_coaches.domain.reservation.exceptions.TimeNotAvailableException;
import com.coaching.taha_coaches.domain.sessiontype.exceptions.SessionTypeNotFoundException;
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

    private String resolve(String key) {
        return messageSource.getMessage(key, null, key, LocaleContextHolder.getLocale());
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, RuntimeException ex) {
        String key = ex.getMessage();
        return ResponseEntity.status(status)
            .body(Map.of("messageKey", key, "message", resolve(key)));
    }

    @ExceptionHandler(TimeNotAvailableException.class)
    public ResponseEntity<Map<String, String>> handleTimeNotAvailable(TimeNotAvailableException ex) {
        return error(HttpStatus.CONFLICT, ex);
    }

    @ExceptionHandler(ReservationNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(ReservationNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, ex);
    }

    @ExceptionHandler(ReservationNotCancellableException.class)
    public ResponseEntity<Map<String, String>> handleNotCancellable(ReservationNotCancellableException ex) {
        return error(HttpStatus.CONFLICT, ex);
    }

    @ExceptionHandler(ReservationNotApprovableException.class)
    public ResponseEntity<Map<String, String>> handleNotApprovable(ReservationNotApprovableException ex) {
        return error(HttpStatus.CONFLICT, ex);
    }

    @ExceptionHandler(AvailabilityOverlapException.class)
    public ResponseEntity<Map<String, String>> handleAvailabilityOverlap(AvailabilityOverlapException ex) {
        return error(HttpStatus.CONFLICT, ex);
    }

    @ExceptionHandler(AvailabilityHasReservationsException.class)
    public ResponseEntity<Map<String, String>> handleAvailabilityHasReservations(AvailabilityHasReservationsException ex) {
        return error(HttpStatus.CONFLICT, ex);
    }

    @ExceptionHandler(SessionTypeNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleSessionTypeNotFound(SessionTypeNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, ex);
    }
}
