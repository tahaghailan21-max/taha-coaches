package com.coaching.taha_coaches.domain.reservation;

public class SlotNotAvailableException extends RuntimeException {
    public SlotNotAvailableException() {
        super("error.slot.notAvailable");
    }
}