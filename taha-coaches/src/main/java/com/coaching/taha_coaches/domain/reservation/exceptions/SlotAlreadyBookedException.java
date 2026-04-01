package com.coaching.taha_coaches.domain.reservation.exceptions;

public class SlotAlreadyBookedException extends RuntimeException {
    public SlotAlreadyBookedException() {
        super("error.slot.alreadyBooked");
    }
}