package com.coaching.taha_coaches.domain.reservation.exceptions;

public class SlotNotAvailableException extends RuntimeException {
    public SlotNotAvailableException() {
        super("error.slot.notAvailable");
    }
}