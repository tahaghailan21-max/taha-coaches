package com.coaching.taha_coaches.domain.reservation;

import com.coaching.taha_coaches.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    /**
     * Returns true if any PENDING or APPROVED reservation on the given date
     * overlaps with the [newStartTime, newEndTime[ window.
     *
     * Overlap condition: existing.start < newEnd AND existing.end > newStart
     *
     * ⚠️ The expression (r.time + r.durationMinutes * INTERVAL '1 MINUTE') is
     * PostgreSQL-specific JPQL. If you ever switch to H2 (tests) or MySQL,
     * either store endTime as a column or override this query per dialect.
     */
    @Query(value = """
                SELECT CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END
                FROM reservations r
                WHERE r.date = :date
                  AND r.status IN ('PENDING', 'APPROVED')
                  AND r.time < :newEndTime
                  AND (r.time + r.duration_minutes * INTERVAL '1 minute') > :newStartTime
            """, nativeQuery = true)
    boolean existsOverlapping(
            @Param("date") LocalDate date,
            @Param("newStartTime") LocalTime newStartTime,
            @Param("newEndTime") LocalTime newEndTime);

    /**
     * Returns all reservations for a given date (all statuses).
     * Filtering by status is done in the service layer.
     */
    List<Reservation> findByDate(LocalDate date);
    /** Used by getMyReservations — newest bookings shown first. */
    List<Reservation> findByUserOrderByDateDescTimeDesc(User user);


}