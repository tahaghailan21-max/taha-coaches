package com.coaching.taha_coaches.domain.reservation;

import com.coaching.taha_coaches.infrastructure.config.BookingProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ReservationMaintenanceJob {

    private final ReservationRepository reservationRepository;
    private final BookingProperties     config;

    @Scheduled(fixedDelay = 900_000)
    @Transactional
    public void run() {
        Instant   expiryThreshold = Instant.now().minus(config.pendingExpiryHours(), ChronoUnit.HOURS);
        LocalDate today           = LocalDate.now();
        LocalTime nowTime         = LocalTime.now();

        // Cancel PENDING that exceeded expiry time
        List<Reservation> expiredPending = reservationRepository
            .findByStatusAndCreatedAtBefore(ReservationStatus.PENDING, expiryThreshold);
        expiredPending.forEach(r -> r.setStatus(ReservationStatus.CANCELLED));

        // Cancel PENDING whose session date is already past
        List<Reservation> pastPending = reservationRepository
            .findByStatusAndDateLessThan(ReservationStatus.PENDING, today);
        pastPending.forEach(r -> r.setStatus(ReservationStatus.CANCELLED));

        // Auto-complete APPROVED whose session date is past
        List<Reservation> pastApproved = reservationRepository
            .findByStatusAndDateLessThan(ReservationStatus.APPROVED, today);
        pastApproved.forEach(r -> r.setStatus(ReservationStatus.COMPLETED));

        // Auto-complete APPROVED that ended today before now
        List<Reservation> todayApproved = reservationRepository
            .findByStatusAndDateAndEndTimeBefore(ReservationStatus.APPROVED, today, nowTime);
        todayApproved.forEach(r -> r.setStatus(ReservationStatus.COMPLETED));

        reservationRepository.saveAll(expiredPending);
        reservationRepository.saveAll(pastPending);
        reservationRepository.saveAll(pastApproved);
        reservationRepository.saveAll(todayApproved);
    }
}
