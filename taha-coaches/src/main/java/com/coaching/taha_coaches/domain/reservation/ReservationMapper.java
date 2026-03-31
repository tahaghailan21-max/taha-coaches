package com.coaching.taha_coaches.domain.reservation;

public class ReservationMapper {

    public static ReservationDto toDto(Reservation r) {
        return new ReservationDto(
                r.getId().toString(),
                r.getDate(),
                r.getTime(),
                r.getDurationMinutes(),
                r.getStatus().name(),
                r.getNotes()
        );
    }
}