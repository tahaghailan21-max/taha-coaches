package com.coaching.taha_coaches.domain.booking;

import com.coaching.taha_coaches.domain.availability.Availability;
import com.coaching.taha_coaches.domain.availability.AvailabilityRepository;
import com.coaching.taha_coaches.domain.reservation.Reservation;
import com.coaching.taha_coaches.domain.reservation.ReservationRepository;
import com.coaching.taha_coaches.domain.reservation.ReservationStatus;
import com.coaching.taha_coaches.domain.sessiontype.SessionType;
import com.coaching.taha_coaches.infrastructure.config.BookingProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingTimeService {

    private final AvailabilityRepository availabilityRepository;
    private final ReservationRepository  reservationRepository;
    private final BookingProperties      config;

    private static final List<ReservationStatus> BLOCKING =
        List.of(ReservationStatus.PENDING, ReservationStatus.APPROVED);

    public List<TimeRange> getFreeTimes(LocalDate date, SessionType sessionType) {
        LocalDate today = LocalDate.now();
        if (date.isBefore(today) || date.isAfter(today.plusDays(config.horizonDays()))) {
            return List.of();
        }
        List<Availability> windows  = availabilityRepository.findByDateAndIsActiveTrue(date);
        List<Reservation>  blocking = reservationRepository.findByDateAndStatusIn(date, BLOCKING);
        return computeFreeTimes(date, sessionType, windows, blocking);
    }

    public Map<LocalDate, Long> getFreeCounts(LocalDate start, LocalDate end, SessionType sessionType) {
        List<Availability> allWindows = availabilityRepository
            .findByDateBetweenAndIsActiveTrueOrderByDateAscStartTimeAsc(start, end);
        List<Reservation>  allBlocking = reservationRepository
            .findByDateBetweenAndStatusIn(start, end, BLOCKING);

        Map<LocalDate, Long> counts = new LinkedHashMap<>();
        LocalDate cursor = start;
        while (!cursor.isAfter(end)) {
            final LocalDate d = cursor;
            List<Availability> windows = allWindows.stream()
                .filter(a -> a.getDate().equals(d)).collect(Collectors.toList());
            List<Reservation> blocking = allBlocking.stream()
                .filter(r -> r.getDate().equals(d)).collect(Collectors.toList());
            counts.put(d, (long) computeFreeTimes(d, sessionType, windows, blocking).size());
            cursor = cursor.plusDays(1);
        }
        return counts;
    }

    public boolean isTimeAvailable(LocalDate date, LocalTime startTime, SessionType sessionType) {
        LocalTime endTime = startTime.plusMinutes(sessionType.getDurationMinutes());
        List<Availability> windows = availabilityRepository.findByDateAndIsActiveTrue(date);
        boolean fitsInWindow = windows.stream().anyMatch(w ->
            !startTime.isBefore(w.getStartTime()) && !endTime.isAfter(w.getEndTime())
        );
        if (!fitsInWindow) return false;
        List<Reservation> blocking = reservationRepository.findByDateAndStatusIn(date, BLOCKING);
        return !hasOverlap(startTime, endTime, blocking);
    }

    private List<TimeRange> computeFreeTimes(LocalDate date, SessionType sessionType,
                                              List<Availability> windows, List<Reservation> blocking) {
        LocalDateTime noticeDeadline = LocalDateTime.now().plusHours(config.minNoticeHours());
        int duration = sessionType.getDurationMinutes();
        int step     = config.gridMinutes();
        List<TimeRange> result = new ArrayList<>();

        for (Availability window : windows) {
            LocalTime cursor    = window.getStartTime();
            LocalTime windowEnd = window.getEndTime();

            while (!cursor.plusMinutes(duration).isAfter(windowEnd)) {
                LocalTime slotEnd = cursor.plusMinutes(duration);
                if (date.atTime(cursor).isAfter(noticeDeadline) && !hasOverlap(cursor, slotEnd, blocking)) {
                    result.add(new TimeRange(cursor, slotEnd));
                }
                cursor = cursor.plusMinutes(step);
            }
        }

        result.sort(Comparator.comparing(TimeRange::startTime));
        return result;
    }

    private boolean hasOverlap(LocalTime start, LocalTime end, List<Reservation> blocking) {
        for (Reservation r : blocking) {
            if (start.isBefore(r.getEndTime()) && r.getStartTime().isBefore(end)) return true;
        }
        return false;
    }
}
