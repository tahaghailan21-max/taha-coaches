package com.coaching.taha_coaches.presentation.controller;

import com.coaching.taha_coaches.domain.reservation.CreateReservationRequest;
import com.coaching.taha_coaches.domain.reservation.Reservation;
import com.coaching.taha_coaches.domain.reservation.ReservationService;
import com.coaching.taha_coaches.infrastructure.auth.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<Reservation> create(
        @RequestBody CreateReservationRequest request,
        @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return ResponseEntity.ok(reservationService.create(request, principal.getUser()));
    }

    @GetMapping("/me")
    public ResponseEntity<List<Reservation>> getMyReservations(
        @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return ResponseEntity.ok(reservationService.getForUser(principal.getUser().getId()));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Reservation> cancelOwner(
        @PathVariable UUID id,
        @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return ResponseEntity.ok(reservationService.cancelOwner(id, principal.getUser()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/cancel/admin")
    public ResponseEntity<Reservation> cancelAdmin(@PathVariable UUID id) {
        return ResponseEntity.ok(reservationService.cancelAdmin(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/approve")
    public ResponseEntity<Reservation> approve(@PathVariable UUID id) {
        return ResponseEntity.ok(reservationService.approve(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/decline")
    public ResponseEntity<Reservation> decline(@PathVariable UUID id) {
        return ResponseEntity.ok(reservationService.decline(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/complete")
    public ResponseEntity<Reservation> complete(@PathVariable UUID id) {
        return ResponseEntity.ok(reservationService.complete(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pending")
    public ResponseEntity<List<Reservation>> getPending() {
        return ResponseEntity.ok(reservationService.getPending());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Reservation>> getAll() {
        return ResponseEntity.ok(reservationService.getAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/date")
    public ResponseEntity<List<Reservation>> getForDate(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(reservationService.getForDate(date));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Reservation>> getForUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(reservationService.getForUser(userId));
    }
}
