package com.coaching.taha_coaches.domain.reservation.exceptions;

public class TimeNotAvailableException extends RuntimeException {
    public TimeNotAvailableException() {
        super("error.booking.timeNotAvailable");
    }
}
