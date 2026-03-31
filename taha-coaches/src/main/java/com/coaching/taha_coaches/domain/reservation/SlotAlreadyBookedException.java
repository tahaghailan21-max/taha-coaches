package com.coaching.taha_coaches.domain.reservation;

public class SlotAlreadyBookedException extends RuntimeException {
    public SlotAlreadyBookedException() {
        super("error.slot.alreadyBooked");
    }
}