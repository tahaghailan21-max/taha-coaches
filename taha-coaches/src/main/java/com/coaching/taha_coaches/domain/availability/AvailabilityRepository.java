package com.coaching.taha_coaches.domain.availability;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AvailabilityRepository extends JpaRepository<Availability, UUID> {

    /** All windows for a date regardless of active status (used by admin). */
    List<Availability> findByDate(LocalDate date);

    /** Only active windows for a date (used by booking validation & slot generation). */
    List<Availability> findByDateAndIsActiveTrue(LocalDate date);

    // AvailabilityRepository.java
    List<Availability> findByDateBetweenOrderByDateAscStartTimeAsc(LocalDate start, LocalDate end);
}