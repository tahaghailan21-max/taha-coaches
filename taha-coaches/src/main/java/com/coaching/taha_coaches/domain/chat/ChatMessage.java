package com.coaching.taha_coaches.domain.chat;

import com.coaching.taha_coaches.domain.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * A single chat message. Postgres is the source of truth — the WebSocket
 * broadcast is only the live-delivery mechanism.
 */
@Entity
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_chat_messages_conversation", columnList = "conversation_id, sent_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue
    private UUID id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "sent_at", nullable = false, updatable = false)
    private Instant sentAt;

    /** Set when the other participant opens the conversation. */
    @Column(name = "read_at")
    private Instant readAt;

    @PrePersist
    public void prePersist() {
        this.sentAt = Instant.now();
    }

    @JsonProperty("conversationId")
    public UUID getConversationId() { return conversation != null ? conversation.getId() : null; }

    @JsonProperty("senderId")
    public UUID getSenderId() { return sender != null ? sender.getId() : null; }

    @JsonProperty("senderName")
    public String getSenderName() { return sender != null ? sender.getName() : null; }
}
