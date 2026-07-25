package com.coaching.taha_coaches.infrastructure.websocket;

import com.coaching.taha_coaches.domain.chat.Conversation;
import com.coaching.taha_coaches.domain.chat.ConversationRepository;
import com.coaching.taha_coaches.infrastructure.auth.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.UUID;

/**
 * Blocks SUBSCRIBE frames to /topic/conversations/{id} unless the connected
 * user is the conversation's client or the coach (ADMIN).
 *
 * Without this, any logged-in user could subscribe to any conversation id and
 * read someone else's chat live.
 */
@Component
@RequiredArgsConstructor
public class ChatSubscriptionGuard implements ChannelInterceptor {

    private static final String TOPIC_PREFIX = "/topic/conversations/";

    private final ConversationRepository conversationRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();
            if (destination != null && destination.startsWith(TOPIC_PREFIX)) {
                authorize(destination, accessor.getUser());
            }
        }
        return message;
    }

    private void authorize(String destination, Principal user) {
        if (user == null) {
            throw new AccessDeniedException("Not authenticated");
        }

        boolean isAdmin = user instanceof Authentication auth
                && auth.getAuthorities().stream()
                       .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (isAdmin) return;

        UUID conversationId;
        try {
            conversationId = UUID.fromString(destination.substring(TOPIC_PREFIX.length()));
        } catch (IllegalArgumentException e) {
            throw new AccessDeniedException("Invalid conversation id");
        }

        // Unwrap our AuthenticatedUser from the Authentication token.
        // (Authentication#getName would return the email here, because
        // AuthenticatedUser implements UserDetails — so we go via the principal.)
        if (!(user instanceof Authentication auth2)
                || !(auth2.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new AccessDeniedException("Unsupported principal");
        }
        UUID userId = principal.getUser().getId();

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AccessDeniedException("Conversation not found"));

        if (!conversation.getClient().getId().equals(userId)) {
            throw new AccessDeniedException("Not a participant of this conversation");
        }
    }
}
