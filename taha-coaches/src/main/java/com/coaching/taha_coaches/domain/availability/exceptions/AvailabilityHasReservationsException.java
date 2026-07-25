package com.coaching.taha_coaches.domain.availability.exceptions;

import java.util.UUID;

public class AvailabilityHasReservationsException extends RuntimeException {
    public AvailabilityHasReservationsException(UUID id) {
        super("error.availability.hasReservations");
    }
}
