package com.coaching.taha_coaches.domain.availability.exceptions;

public class AvailabilityOverlapException extends RuntimeException {

    public AvailabilityOverlapException() {
        super("admin.error.availability.overlap");
    }
}