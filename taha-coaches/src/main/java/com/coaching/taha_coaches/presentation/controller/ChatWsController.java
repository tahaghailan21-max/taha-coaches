package com.coaching.taha_coaches.presentation.controller;

import com.coaching.taha_coaches.domain.chat.ChatMessage;
import com.coaching.taha_coaches.domain.chat.ChatService;
import com.coaching.taha_coaches.infrastructure.auth.AuthenticatedUser;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

/**
 * WebSocket side of the chat. Frames sent by browsers to /app/chat.send land
 * here (the /app prefix routes to @MessageMapping methods, see WebSocketConfig).
 *
 * Order matters: persist FIRST (Postgres is the source of truth), broadcast
 * second. If the insert fails, nobody is told a message exists that doesn't.
 */
@Controller
@RequiredArgsConstructor
public class ChatWsController {

    private final ChatService chatService;
    private final SimpMessagingTemplate broker;

    public record IncomingMessage(UUID conversationId, String body) {}

    @MessageMapping("/chat.send")
    public void send(@Payload IncomingMessage incoming, Principal principal) {
        // The WS principal is the OAuth2AuthenticationToken from the session
        // cookie that authenticated the handshake. Unwrap our user from it
        // (token.getName() would give the email, not the id).
        if (!(principal instanceof Authentication auth)
                || !(auth.getPrincipal() instanceof AuthenticatedUser user)) {
            throw new AccessDeniedException("Unsupported principal");
        }
        UUID senderId = user.getUser().getId();

        ChatMessage saved = chatService.saveMessage(
                incoming.conversationId(), senderId, incoming.body());

        // Fan-out: the broker copies this to every socket subscribed to the topic
        // (both participants if online — including the sender, who uses the echo
        // as delivery confirmation).
        broker.convertAndSend("/topic/conversations/" + incoming.conversationId(), saved);
    }
}
