package com.coaching.taha_coaches.domain.chat;

import java.time.Instant;
import java.util.UUID;

/** One row of the coach inbox: who, last message preview, unread badge. */
public record ConversationSummary(
        UUID id,
        UUID clientId,
        String clientName,
        String clientAvatar,
        String lastMessageBody,
        Instant lastMessageAt,
        long unreadCount
) {}
