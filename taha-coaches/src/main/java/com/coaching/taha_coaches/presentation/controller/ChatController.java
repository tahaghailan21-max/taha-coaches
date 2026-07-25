package com.coaching.taha_coaches.presentation.controller;

import com.coaching.taha_coaches.domain.chat.ChatMessage;
import com.coaching.taha_coaches.domain.chat.ChatService;
import com.coaching.taha_coaches.domain.chat.Conversation;
import com.coaching.taha_coaches.domain.chat.ConversationSummary;
import com.coaching.taha_coaches.infrastructure.auth.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST side of the chat: everything that is "state", not "live event".
 * History, inbox and read-marking go through here; only new-message delivery
 * uses the WebSocket.
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /** Client space: returns (and lazily creates) the caller's own conversation. */
    @GetMapping("/conversation")
    public ResponseEntity<Conversation> myConversation(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return ResponseEntity.ok(chatService.getOrCreateForClient(principal.getUser()));
    }

    /** Coach inbox: all conversations with last-message preview and unread counts. */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationSummary>> conversations() {
        return ResponseEntity.ok(chatService.listForCoach());
    }

    /** Paginated history, newest first (page 0 = latest 50). */
    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<List<ChatMessage>> messages(
            @PathVariable UUID conversationId,
            @RequestParam(defaultValue = "0") int page,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return ResponseEntity.ok(chatService.getMessages(conversationId, principal.getUser(), page));
    }

    /** Marks every message from the other participant as read. */
    @PatchMapping("/{conversationId}/read")
    public ResponseEntity<Void> markRead(
            @PathVariable UUID conversationId,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        chatService.markRead(conversationId, principal.getUser());
        return ResponseEntity.noContent().build();
    }
}
