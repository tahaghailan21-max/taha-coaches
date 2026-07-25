package com.coaching.taha_coaches.presentation.controller;

import com.coaching.taha_coaches.domain.booking.BookingTimeService;
import com.coaching.taha_coaches.domain.booking.TimeRange;
import com.coaching.taha_coaches.domain.sessiontype.SessionType;
import com.coaching.taha_coaches.domain.sessiontype.SessionTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class BookingController {

    private final BookingTimeService bookingTimeService;
    private final SessionTypeService sessionTypeService;

    @GetMapping("/free-times")
    public ResponseEntity<List<TimeRange>> getFreeTimes(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam UUID sessionTypeId
    ) {
        SessionType sessionType = sessionTypeService.getById(sessionTypeId);
        return ResponseEntity.ok(bookingTimeService.getFreeTimes(date, sessionType));
    }

    @GetMapping("/free-times/counts")
    public ResponseEntity<Map<LocalDate, Long>> getFreeCounts(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
        @RequestParam UUID sessionTypeId
    ) {
        SessionType sessionType = sessionTypeService.getById(sessionTypeId);
        return ResponseEntity.ok(bookingTimeService.getFreeCounts(start, end, sessionType));
    }
}
