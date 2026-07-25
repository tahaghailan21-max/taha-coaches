package com.coaching.taha_coaches.domain.reservation.exceptions;

public class ReservationNotApprovableException extends RuntimeException {
    public ReservationNotApprovableException() {
        super("error.reservation.notApprovable");
    }
}
