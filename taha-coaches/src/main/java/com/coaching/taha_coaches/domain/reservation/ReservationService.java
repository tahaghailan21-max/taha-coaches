package com.coaching.taha_coaches.domain.reservation;

import com.coaching.taha_coaches.domain.availability.AvailabilityRepository;
import com.coaching.taha_coaches.domain.booking.BookingTimeService;
import com.coaching.taha_coaches.domain.reservation.exceptions.*;
import com.coaching.taha_coaches.domain.sessiontype.SessionType;
import com.coaching.taha_coaches.domain.sessiontype.SessionTypeService;
import com.coaching.taha_coaches.domain.user.User;
import com.coaching.taha_coaches.infrastructure.config.BookingProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository  reservationRepository;
    private final AvailabilityRepository availabilityRepository;
    private final SessionTypeService     sessionTypeService;
    private final BookingTimeService     bookingTimeService;
    private final BookingProperties      config;

    @Transactional
    public Reservation create(CreateReservationRequest req, User user) {
        LocalDate today = LocalDate.now();
        if (req.date().isBefore(today) || req.date().isAfter(today.plusDays(config.horizonDays()))) {
            throw new TimeNotAvailableException();
        }

        SessionType sessionType = sessionTypeService.getById(req.sessionTypeId());
        LocalTime   endTime     = req.startTime().plusMinutes(sessionType.getDurationMinutes());

        if (!req.date().atTime(req.startTime()).isAfter(LocalDateTime.now().plusHours(config.minNoticeHours()))) {
            throw new TimeNotAvailableException();
        }

        // Lock availabilities for this date to serialize concurrent bookings on the same day
        availabilityRepository.findByDateWithLock(req.date());

        if (!bookingTimeService.isTimeAvailable(req.date(), req.startTime(), sessionType)) {
            throw new TimeNotAvailableException();
        }

        return reservationRepository.save(Reservation.builder()
            .user(user)
            .sessionType(sessionType)
            .date(req.date())
            .startTime(req.startTime())
            .endTime(endTime)
            .notes(req.notes())
            .status(ReservationStatus.PENDING)
            .build());
    }

    @Transactional
    public Reservation approve(UUID id) {
        Reservation r = find(id);
        if (r.getStatus() != ReservationStatus.PENDING) throw new ReservationNotApprovableException();
        r.setStatus(ReservationStatus.APPROVED);
        return reservationRepository.save(r);
    }

    @Transactional
    public Reservation decline(UUID id) {
        Reservation r = find(id);
        if (r.getStatus() != ReservationStatus.PENDING) throw new ReservationNotDeclinableException();
        r.setStatus(ReservationStatus.DECLINED);
        return reservationRepository.save(r);
    }

    @Transactional
    public Reservation cancelOwner(UUID id, User user) {
        Reservation r = reservationRepository.findById(id)
            .filter(res -> user.getId().equals(res.getUserId()))
            .orElseThrow(ReservationNotFoundException::new);

        if (isTerminal(r.getStatus())) throw new ReservationNotCancellableException();

        LocalDateTime cutoff = r.getDate().atTime(r.getStartTime()).minusHours(config.cancelCutoffHours());
        if (LocalDateTime.now().isAfter(cutoff)) throw new ReservationNotCancellableException();

        r.setStatus(ReservationStatus.CANCELLED);
        return reservationRepository.save(r);
    }

    @Transactional
    public Reservation cancelAdmin(UUID id) {
        Reservation r = find(id);
        if (r.getStatus() == ReservationStatus.CANCELLED || r.getStatus() == ReservationStatus.COMPLETED) {
            throw new ReservationNotCancellableException();
        }
        r.setStatus(ReservationStatus.CANCELLED);
        return reservationRepository.save(r);
    }

    @Transactional
    public Reservation complete(UUID id) {
        Reservation r = find(id);
        if (r.getStatus() != ReservationStatus.APPROVED) {
            throw new IllegalStateException("Only APPROVED reservations can be completed");
        }
        r.setStatus(ReservationStatus.COMPLETED);
        return reservationRepository.save(r);
    }

    public List<Reservation> getForDate(LocalDate date) {
        return reservationRepository.findByDateOrderByStartTimeAsc(date);
    }

    public List<Reservation> getForUser(UUID userId) {
        return reservationRepository.findByUser_IdOrderByDateAsc(userId);
    }

    public List<Reservation> getPending() {
        return reservationRepository.findByStatusOrderByDateAsc(ReservationStatus.PENDING);
    }

    public List<Reservation> getAll() {
        return reservationRepository.findAllByOrderByDateAsc();
    }

    private Reservation find(UUID id) {
        return reservationRepository.findById(id).orElseThrow(ReservationNotFoundException::new);
    }

    private boolean isTerminal(ReservationStatus s) {
        return s == ReservationStatus.CANCELLED || s == ReservationStatus.COMPLETED
            || s == ReservationStatus.DECLINED;
    }
}
