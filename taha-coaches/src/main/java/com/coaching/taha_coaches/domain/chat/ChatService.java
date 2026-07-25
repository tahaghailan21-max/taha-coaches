package com.coaching.taha_coaches.domain.chat;

import com.coaching.taha_coaches.domain.user.Role;
import com.coaching.taha_coaches.domain.user.User;
import com.coaching.taha_coaches.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private static final int PAGE_SIZE = 50;

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;

    /** A user may access a conversation if they own it or they are the coach. */
    public boolean isParticipant(Conversation c, User u) {
        return u.getRole() == Role.ADMIN || c.getClient().getId().equals(u.getId());
    }

    /** Client side: each client has exactly one conversation, created on first use. */
    @Transactional
    public Conversation getOrCreateForClient(User client) {
        if (client.getRole() == Role.ADMIN) {
            // The coach has no "own" conversation — they answer clients in the inbox.
            throw new AccessDeniedException("Admins use the inbox (/admin/chat)");
        }
        return conversationRepository.findByClient_Id(client.getId())
                .orElseGet(() -> conversationRepository.save(
                        Conversation.builder().client(client).build()));
    }

    @Transactional(readOnly = true)
    public Conversation getConversation(UUID id, User requester) {
        Conversation c = conversationRepository.findById(id)
                .orElseThrow(() -> new AccessDeniedException("Conversation not found"));
        if (!isParticipant(c, requester)) {
            throw new AccessDeniedException("Not a participant of this conversation");
        }
        return c;
    }

    /** Latest messages first; the frontend reverses for display. */
    @Transactional(readOnly = true)
    public List<ChatMessage> getMessages(UUID conversationId, User requester, int page) {
        getConversation(conversationId, requester); // participant check
        return messageRepository
                .findByConversation_IdOrderBySentAtDesc(conversationId, PageRequest.of(page, PAGE_SIZE))
                .getContent();
    }

    /**
     * Persists a message. Called from the WebSocket controller —
     * persist FIRST, broadcast second (the caller broadcasts).
     */
    @Transactional
    public ChatMessage saveMessage(UUID conversationId, UUID senderId, String body) {
        if (body == null || body.trim().isEmpty() || body.length() > 4000) {
            throw new IllegalArgumentException("Invalid message body");
        }
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new AccessDeniedException("Unknown sender"));
        Conversation c = getConversation(conversationId, sender);
        return messageRepository.save(ChatMessage.builder()
                .conversation(c)
                .sender(sender)
                .body(body.trim())
                .build());
    }

    @Transactional
    public void markRead(UUID conversationId, User reader) {
        getConversation(conversationId, reader); // participant check
        messageRepository.markRead(conversationId, reader.getId(), Instant.now());
    }

    /** Coach inbox: all conversations with preview + unread count, newest activity first. */
    @Transactional(readOnly = true)
    public List<ConversationSummary> listForCoach() {
        return conversationRepository.findAll().stream()
                .map(c -> {
                    ChatMessage last = messageRepository
                            .findTopByConversation_IdOrderBySentAtDesc(c.getId()).orElse(null);
                    long unread = messageRepository
                            .countByConversation_IdAndSender_IdAndReadAtIsNull(c.getId(), c.getClient().getId());
                    return new ConversationSummary(
                            c.getId(),
                            c.getClient().getId(),
                            c.getClient().getName(),
                            c.getClient().getAvatarUrl(),
                            last != null ? last.getBody() : null,
                            last != null ? last.getSentAt() : null,
                            unread
                    );
                })
                .sorted(Comparator.comparing(ConversationSummary::lastMessageAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }
}
