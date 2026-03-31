package com.coaching.taha_coaches.domain.reservation;

import com.coaching.taha_coaches.domain.availability.Availability;
import com.coaching.taha_coaches.domain.availability.AvailabilityRepository;
import com.coaching.taha_coaches.domain.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final AvailabilityRepository availabilityRepository;

    /**
     * Creates a reservation for the given user if the slot is valid and free.
     *
     * Flow:
     * 1. Compute endTime from startTime + durationMinutes.
     * 2. Check that the [startTime, endTime] window falls entirely within an
     * active availability window for that date. If not → SlotNotAvailableException.
     * 3. Check at DB level (atomic) that no PENDING/APPROVED reservation overlaps
     * the window. If so → SlotAlreadyBookedException.
     * 4. Persist and return the new PENDING reservation.
     *
     * @param user            the authenticated user making the booking
     * @param date            the date of the session
     * @param time            the desired start time
     * @param durationMinutes 60 or 90 (1h or 1h30)
     * @param notes           optional notes from the user
     */
    public Reservation createReservation(
            User user,
            LocalDate date,
            LocalTime time,
            int durationMinutes,
            String notes) {
        LocalTime endTime = time.plusMinutes(durationMinutes);

        // 1️⃣ Validate: the slot must fall inside an active availability window.
        // Both start and end must be within the same availability block — we
        // do NOT allow a session to straddle two separate blocks.
        boolean slotValid = availabilityRepository.findByDateAndIsActiveTrue(date).stream()
                .anyMatch(a -> !time.isBefore(a.getStartTime()) && // start >= availability.start
                        !endTime.isAfter(a.getEndTime()) // end <= availability.end
                );

        if (!slotValid) {
            throw new SlotNotAvailableException();
        }

        // 2️⃣ Validate: no existing PENDING or APPROVED reservation overlaps.
        // This check is done at DB level to be safe against concurrent requests.
        // (An in-memory check on the same data would have a race-condition window.)
        if (reservationRepository.existsOverlapping(date, time, endTime)) {
            throw new SlotAlreadyBookedException();
        }

        // 3️⃣ Persist the reservation with PENDING status.
        // It will be APPROVED or REJECTED by the coach afterward.
        Reservation reservation = Reservation.builder()
                .user(user)
                .date(date)
                .time(time)
                .durationMinutes(durationMinutes)
                .status(ReservationStatus.PENDING)
                .notes(notes)
                .build();

        return reservationRepository.save(reservation);
    }

    /**
     * Returns all active (PENDING or APPROVED) reservations for a given date.
     * Used by the frontend to grey out already-booked time slots.
     */
    public List<Reservation> getReservationsForDay(LocalDate date) {
        return reservationRepository.findByDate(date).stream()
                .filter(r -> r.getStatus() == ReservationStatus.PENDING ||
                        r.getStatus() == ReservationStatus.APPROVED)
                .toList();
    }

    /**
     * Returns all start times the user could pick for a given date and duration.
     *
     * Flow:
     * - For each active availability window, generate candidate slots every 30 min.
     * - Discard any candidate whose [start, start+duration] window overlaps an
     * existing active reservation.
     * - Return the remaining candidates in chronological order.
     *
     * @param date                   the date to query
     * @param desiredDurationMinutes 60 or 90
     */
    public List<LocalTime> getAvailableSlots(LocalDate date, int desiredDurationMinutes) {
        List<Availability> availabilities = availabilityRepository.findByDateAndIsActiveTrue(date);
        List<Reservation> bookedSlots = getReservationsForDay(date);
        List<LocalTime> availableSlots = new ArrayList<>();

        for (Availability a : availabilities) {
            LocalTime current = a.getStartTime();
            // Last valid start: there must be enough room for the full duration
            LocalTime lastPossibleStart = a.getEndTime().minusMinutes(desiredDurationMinutes);

            while (!current.isAfter(lastPossibleStart)) {
                final LocalTime slotStart = current;
                final LocalTime slotEnd = current.plusMinutes(desiredDurationMinutes);

                boolean overlaps = bookedSlots.stream().anyMatch(r -> {
                    LocalTime rEnd = r.getTime().plusMinutes(r.getDurationMinutes());
                    // Standard interval overlap: A starts before B ends AND A ends after B starts
                    return slotStart.isBefore(rEnd) && slotEnd.isAfter(r.getTime());
                });

                if (!overlaps) {
                    availableSlots.add(slotStart);
                }

                current = current.plusMinutes(30); // slots offered every 30 minutes
            }
        }

        return availableSlots;
    }

    /**
     * Returns all reservations for the authenticated user, most recent first.
     * The user is resolved from the JWT by Spring Security — the controller
     * passes it in directly.
     */
    public List<Reservation> getMyReservations(User user) {
        return reservationRepository.findByUserOrderByDateDescTimeDesc(user);
    }

    /**
     * Cancels a PENDING reservation belonging to the authenticated user.
     *
     * Flow:
     *  1. Load the reservation — 404 if not found.
     *  2. Verify ownership — return 404 (not 403) to avoid leaking existence.
     *  3. Verify it is still PENDING — only pending reservations can be cancelled.
     *  4. Set status to CANCELLED and persist.
     */
    public void cancelReservation(User user, UUID id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(ReservationNotFoundException::new);

        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new ReservationNotFoundException(); // intentional — don't leak existence
        }

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new ReservationNotCancellableException();
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
    }





}