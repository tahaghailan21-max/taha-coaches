package com.coaching.taha_coaches.domain.reservation.exceptions;

public class ReservationNotDeclinableException extends RuntimeException {
    public ReservationNotDeclinableException() {
        super("error.reservation.notDeclinable");
    }
}
