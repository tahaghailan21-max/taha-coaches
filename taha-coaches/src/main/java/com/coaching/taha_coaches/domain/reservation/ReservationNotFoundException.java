package com.coaching.taha_coaches.domain.reservation;

public class ReservationNotFoundException extends RuntimeException {
    public ReservationNotFoundException() {
        super("error.reservation.notFound");
    }
}