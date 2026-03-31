package com.coaching.taha_coaches.domain.availability;

import java.time.LocalDate;
import java.time.LocalTime;

public record CreateAvailabilityRequest(
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime
) {}