package com.coaching.taha_coaches.domain.chat;

import com.coaching.taha_coaches.domain.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * One conversation per client. The coach side is implicit (single-coach app):
 * every ADMIN user can read and write in any conversation.
 */
@Entity
@Table(name = "conversations",
        uniqueConstraints = @UniqueConstraint(columnNames = "client_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue
    private UUID id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }

    @JsonProperty("clientId")
    public UUID getClientId() { return client != null ? client.getId() : null; }

    @JsonProperty("clientName")
    public String getClientName() { return client != null ? client.getName() : null; }
}
