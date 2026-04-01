package com.coaching.taha_coaches.presentation.controller;

import com.coaching.taha_coaches.domain.reservation.*;
import com.coaching.taha_coaches.domain.user.User;
import com.coaching.taha_coaches.infrastructure.auth.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;


@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    /**
     * POST /api/reservations
     * Creates a new reservation for the authenticated user.
     */
    @PostMapping
    public ResponseEntity<ReservationDto> create(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @RequestBody CreateReservationRequest request
    ) {
        if (principal == null) return ResponseEntity.status(401).build();

        User user = principal.getUser();
        Reservation reservation = reservationService.createReservation(
                user,
                request.date(),
                request.time(),
                request.durationMinutes(),
                request.notes()
        );

        return ResponseEntity.ok(ReservationMapper.toDto(reservation));
    }

    /**
     * GET /api/reservations/available-slots?date=YYYY-MM-DD&duration=60
     * Returns available start times for a given date and duration.
     * Used by the booking page to render the time grid.
     */
    @GetMapping("/available-slots")
    public ResponseEntity<List<LocalTime>> getAvailableSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam int duration
    ) {
        return ResponseEntity.ok(reservationService.getAvailableSlots(date, duration));
    }

    /**
     * GET /api/reservations/day?date=YYYY-MM-DD
     * Returns all active (PENDING or APPROVED) reservations for a given date.
     * Used by the admin or booking page to show booked slots.
     */
    @GetMapping("/day")
    public ResponseEntity<List<ReservationDto>> getForDay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<Reservation> reservations = reservationService.getReservationsForDay(date);
        List<ReservationDto> dtos = reservations.stream()
                .map(ReservationMapper::toDto)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    /**
     * GET /api/reservations/my
     * Returns all reservations belonging to the authenticated user.
     */
    @GetMapping("/my")
    public ResponseEntity<List<ReservationDto>> getMyReservations(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        if (principal == null) return ResponseEntity.status(401).build();

        User user = principal.getUser();
        List<Reservation> reservations = reservationService.getMyReservations(user);
        List<ReservationDto> dtos = reservations.stream()
                .map(ReservationMapper::toDto)
                .toList();
        return ResponseEntity.ok(dtos);
    }


    /**
     * PATCH /api/reservations/{id}/cancel
     * Cancels a PENDING reservation. Only the owner can cancel their own reservation.
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @PathVariable java.util.UUID id
    ) {
        if (principal == null) return ResponseEntity.status(401).build();

        User user = principal.getUser();
        reservationService.cancelReservation(user, id);
        return ResponseEntity.noContent().build();
    }


}
