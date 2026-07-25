package com.coaching.taha_coaches.domain.availability;

import com.coaching.taha_coaches.domain.availability.exceptions.AvailabilityHasReservationsException;
import com.coaching.taha_coaches.domain.availability.exceptions.AvailabilityOverlapException;
import com.coaching.taha_coaches.domain.reservation.Reservation;
import com.coaching.taha_coaches.domain.reservation.ReservationRepository;
import com.coaching.taha_coaches.domain.reservation.ReservationStatus;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final ReservationRepository  reservationRepository;

    public List<Availability> getForRange(LocalDate start, LocalDate end) {
        return availabilityRepository.findByDateBetweenOrderByDateAscStartTimeAsc(start, end);
    }

    public List<Availability> getForMonth(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end   = start.withDayOfMonth(start.lengthOfMonth());
        return availabilityRepository.findByDateBetweenOrderByDateAscStartTimeAsc(start, end);
    }

    public List<Availability> getForDate(LocalDate date) {
        return availabilityRepository.findByDate(date);
    }

    @Transactional
    public Availability create(CreateAvailabilityRequest request) {
        List<Availability> existing = availabilityRepository.findByDate(request.date());
        boolean hasOverlap = existing.stream().anyMatch(a ->
            a.getStartTime().isBefore(request.endTime()) &&
            request.startTime().isBefore(a.getEndTime())
        );
        if (hasOverlap) throw new AvailabilityOverlapException();

        Availability av = Availability.builder()
            .date(request.date())
            .startTime(request.startTime())
            .endTime(request.endTime())
            .isActive(true)
            .build();
        return availabilityRepository.save(av);
    }

    @Transactional
    public Availability toggle(UUID id, boolean isActive) {
        Availability av = availabilityRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Availability not found: " + id));

        if (!isActive && hasActiveReservations(av)) {
            throw new AvailabilityHasReservationsException(id);
        }

        av.setActive(isActive);
        return availabilityRepository.save(av);
    }

    @Transactional
    public void delete(UUID id) {
        Availability av = availabilityRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Availability not found: " + id));

        if (hasActiveReservations(av)) throw new AvailabilityHasReservationsException(id);
        availabilityRepository.deleteById(id);
    }

    private boolean hasActiveReservations(Availability av) {
        List<Reservation> active = reservationRepository.findByDateAndStatusIn(
            av.getDate(), List.of(ReservationStatus.PENDING, ReservationStatus.APPROVED)
        );
        return active.stream().anyMatch(r ->
            r.getStartTime().isBefore(av.getEndTime()) &&
            av.getStartTime().isBefore(r.getEndTime())
        );
    }
}
