package com.coaching.taha_coaches.domain.availability;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AvailabilityRepository extends JpaRepository<Availability, UUID> {

    List<Availability> findByDate(LocalDate date);

    List<Availability> findByDateAndIsActiveTrue(LocalDate date);

    List<Availability> findByDateBetweenOrderByDateAscStartTimeAsc(LocalDate start, LocalDate end);

    List<Availability> findByDateBetweenAndIsActiveTrueOrderByDateAscStartTimeAsc(LocalDate start, LocalDate end);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Availability a WHERE a.date = :date")
    List<Availability> findByDateWithLock(@Param("date") LocalDate date);
}
