package com.coaching.taha_coaches.domain.availability;

import com.coaching.taha_coaches.domain.availability.exceptions.AvailabilityOverlapException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;


    public List<Availability> getForRange(LocalDate start, LocalDate end) {
        return availabilityRepository
                .findByDateBetweenOrderByDateAscStartTimeAsc(start, end);
    }

    public List<Availability> getForMonth(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end   = start.withDayOfMonth(start.lengthOfMonth());
        return availabilityRepository
                .findByDateBetweenOrderByDateAscStartTimeAsc(start, end);
    }

    /**
     * Returns ALL windows for a date (active + inactive).
     * Used by the admin panel to show every window with its toggle state.
     */
    public List<Availability> getForDate(LocalDate date) {
        return availabilityRepository.findByDate(date);
    }

    /**
     * Creates a new availability window, active by default.
     * The admin picks a date + start/end time; clients can then book within it.
     */
    public Availability create(CreateAvailabilityRequest request) {

        // 1️⃣ Fetch all existing slots for the same date
        List<Availability> existingSlots = availabilityRepository.findByDate(request.date());

        // 2️⃣ Check for overlap
        boolean hasOverlap = existingSlots.stream().anyMatch(slot ->
                !slot.getEndTime().isBefore(request.startTime()) &&
                        !slot.getStartTime().isAfter(request.endTime())
        );

        if (hasOverlap) {
            throw new AvailabilityOverlapException();
        }

        Availability av = Availability.builder()
                .date(request.date())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .isActive(true)
                .build();
        return availabilityRepository.save(av);
    }

    /**
     * Enables or disables a window without deleting it.
     * Disabling a window makes it invisible to the booking page immediately —
     * existing reservations inside it are NOT automatically cancelled.
     */
    public Availability toggle(UUID id, boolean isActive) {
        Availability av = availabilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Availability not found: " + id));
        av.setActive(isActive);
        return availabilityRepository.save(av);
    }

    /**
     * Permanently removes a window.
     * Use with care — existing reservations inside it are NOT automatically cancelled.
     */
    public void delete(UUID id) {
        availabilityRepository.deleteById(id);
    }
}