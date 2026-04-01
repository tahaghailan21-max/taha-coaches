package com.coaching.taha_coaches.presentation.controller;

import com.coaching.taha_coaches.domain.availability.Availability;
import com.coaching.taha_coaches.domain.availability.AvailabilityService;
import com.coaching.taha_coaches.domain.availability.CreateAvailabilityRequest;
import com.coaching.taha_coaches.domain.availability.ToggleAvailabilityRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/availabilities")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    /**
     * GET /api/availabilities/range?start=YYYY-MM-DD&end=YYYY-MM-DD
     * Used by the weekly view when the week spans two calendar months.
     */
    @GetMapping("/range")
    public ResponseEntity<List<Availability>> getForRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return ResponseEntity.ok(availabilityService.getForRange(start, end));
    }

    /**
     * GET /api/availabilities/month?year=2026&month=3
     * Returns all windows for an entire month (admin use).
     */
    @GetMapping("/month")
    public ResponseEntity<List<Availability>> getForMonth(
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ResponseEntity.ok(availabilityService.getForMonth(year, month));
    }

    /**
     * GET /api/availabilities?date=YYYY-MM-DD
     * Returns all availability windows for a given date (active and inactive).
     * Used by the admin availability manager.
     */
    @GetMapping
    public ResponseEntity<List<Availability>> getForDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(availabilityService.getForDate(date));
    }

    /**
     * POST /api/availabilities
     * Creates a new availability window for a given date.
     */
    @PostMapping
    public ResponseEntity<Availability> create(
            @RequestBody CreateAvailabilityRequest request
    ) {
        return ResponseEntity.ok(availabilityService.create(request));
    }

    /**
     * PATCH /api/availabilities/{id}
     * Enables or disables an availability window.
     */
    @PatchMapping("/{id}")
    public ResponseEntity<Availability> toggle(
            @PathVariable UUID id,
            @RequestBody ToggleAvailabilityRequest request
    ) {
        return ResponseEntity.ok(availabilityService.toggle(id, request.isActive()));
    }

    /**
     * DELETE /api/availabilities/{id}
     * Deletes an availability window entirely.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        availabilityService.delete(id);
        return ResponseEntity.noContent().build();
    }
}