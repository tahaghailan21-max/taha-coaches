package com.coaching.taha_coaches.domain.reservation;

import com.coaching.taha_coaches.domain.sessiontype.SessionType;
import com.coaching.taha_coaches.domain.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue
    private UUID id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "session_type_id", nullable = false)
    private SessionType sessionType;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ReservationStatus status = ReservationStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }

    @JsonProperty("userId")
    public UUID getUserId() { return user != null ? user.getId() : null; }

    @JsonProperty("userName")
    public String getUserName() { return user != null ? user.getName() : null; }

    @JsonProperty("sessionTypeCode")
    public String getSessionTypeCode() { return sessionType != null ? sessionType.getCode() : null; }

    @JsonProperty("durationMinutes")
    public int getDurationMinutes() { return sessionType != null ? sessionType.getDurationMinutes() : 0; }
}
