package com.coaching.taha_coaches.domain.reservation.exceptions;

public class ReservationNotCancellableException extends RuntimeException {
    public ReservationNotCancellableException() {
        super("error.reservation.notCancellable");
    }
}