package com.coaching.taha_coaches.domain.reservation;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record CreateReservationRequest(
    LocalDate date,
    LocalTime startTime,
    UUID sessionTypeId,
    String notes
) {}
