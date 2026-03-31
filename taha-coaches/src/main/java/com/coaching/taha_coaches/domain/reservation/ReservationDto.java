package com.coaching.taha_coaches.domain.reservation;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record ReservationDto(
        String  id,
        LocalDate date,
        LocalTime time,
        int durationMinutes,
        String status,
        String notes
) {}