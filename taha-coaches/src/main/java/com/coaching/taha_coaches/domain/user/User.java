package com.coaching.taha_coaches.domain.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"provider", "provider_id"})
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(unique = true)
    private String email;

    private String name;

    @Column(nullable = false)
    private String provider; // "google"

    @Column(name = "provider_id", nullable = false)
    private String providerId;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "avatar_url")
    private String avatarUrl; // Can store the R2 object key or full URL

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }
}
