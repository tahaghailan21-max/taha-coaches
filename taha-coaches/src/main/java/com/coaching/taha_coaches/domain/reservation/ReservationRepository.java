package com.coaching.taha_coaches.domain.reservation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    List<Reservation> findByDateOrderByStartTimeAsc(LocalDate date);

    List<Reservation> findByUser_IdOrderByDateAsc(UUID userId);

    List<Reservation> findByStatusOrderByDateAsc(ReservationStatus status);

    List<Reservation> findAllByOrderByDateAsc();

    List<Reservation> findByDateAndStatusIn(LocalDate date, List<ReservationStatus> statuses);

    List<Reservation> findByDateBetweenAndStatusIn(LocalDate start, LocalDate end, List<ReservationStatus> statuses);

    List<Reservation> findByStatusAndCreatedAtBefore(ReservationStatus status, Instant threshold);

    List<Reservation> findByStatusAndDateLessThan(ReservationStatus status, LocalDate date);

    List<Reservation> findByStatusAndDateAndEndTimeBefore(ReservationStatus status, LocalDate date, LocalTime time);
}
