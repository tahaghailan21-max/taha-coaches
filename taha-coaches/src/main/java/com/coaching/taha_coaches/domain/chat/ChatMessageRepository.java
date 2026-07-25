package com.coaching.taha_coaches.domain.chat;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    Page<ChatMessage> findByConversation_IdOrderBySentAtDesc(UUID conversationId, Pageable pageable);

    Optional<ChatMessage> findTopByConversation_IdOrderBySentAtDesc(UUID conversationId);

    /** Unread messages written by the given sender (used for inbox badges). */
    long countByConversation_IdAndSender_IdAndReadAtIsNull(UUID conversationId, UUID senderId);

    /** Marks every message NOT sent by the reader as read. */
    @Modifying
    @Query("""
           update ChatMessage m
              set m.readAt = :now
            where m.conversation.id = :conversationId
              and m.sender.id <> :readerId
              and m.readAt is null
           """)
    int markRead(@Param("conversationId") UUID conversationId,
                 @Param("readerId") UUID readerId,
                 @Param("now") Instant now);
}
