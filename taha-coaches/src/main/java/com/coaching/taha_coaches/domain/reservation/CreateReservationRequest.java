package com.coaching.taha_coaches.domain.reservation;

import java.time.LocalDate;
import java.time.LocalTime;

public record CreateReservationRequest(
        LocalDate date,
        LocalTime time,
        int durationMinutes,
        String notes
) {}