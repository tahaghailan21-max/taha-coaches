package com.coaching.taha_coaches.domain.reservation.exceptions;

public class ReservationNotFoundException extends RuntimeException {
    public ReservationNotFoundException() {
        super("error.reservation.notFound");
    }
}