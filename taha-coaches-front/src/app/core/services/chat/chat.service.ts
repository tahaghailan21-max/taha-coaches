import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { RxStomp } from '@stomp/rx-stomp';
import { environment } from '../../../environments/environment';
import { ChatMessage, Conversation, ConversationSummary } from '../../models/chat.model';

/**
 * Chat transport service.
 *
 * REST  → state: history, conversation list, read-marking (DB is the source of truth).
 * STOMP → live events only: a single WebSocket shared by the whole app; each open
 *         conversation is one subscription to /topic/conversations/{id}.
 */
@Injectable({ providedIn: 'root' })
export class ChatService {

  private readonly api = `${environment.apiUrl}/api/chat`;

  /** ws://localhost:8080/ws in dev, wss://… behind HTTPS in prod. */
  private readonly wsUrl = environment.apiUrl.replace(/^http/, 'ws') + '/ws';

  private rxStomp: RxStomp | null = null;
  private readonly isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // ── WebSocket (live delivery) ───────────────────────────────────────────

  /**
   * Lazily opens the WebSocket. Safe to call repeatedly; no-op during SSR.
   * The browser sends the session cookie with the handshake, which is how
   * the backend knows who this socket belongs to.
   */
  private connect(): RxStomp {
    if (!this.rxStomp) {
      this.rxStomp = new RxStomp();
      this.rxStomp.configure({
        brokerURL: this.wsUrl,
        reconnectDelay: 3000,        // auto-reconnect (laptop sleep, Wi-Fi change…)
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
      });
      this.rxStomp.activate();
    }
    return this.rxStomp;
  }

  /**
   * Live stream of messages for one conversation.
   * rx-stomp sends the STOMP SUBSCRIBE frame when the first subscriber arrives
   * and UNSUBSCRIBE when the last one leaves (component destroyed).
   */
  watchConversation(conversationId: string): Observable<ChatMessage> {
    if (!this.isBrowser) return new Observable<ChatMessage>();   // SSR: silent
    return this.connect()
      .watch(`/topic/conversations/${conversationId}`)
      .pipe(map(frame => JSON.parse(frame.body) as ChatMessage));
  }

  /** Publishes a SEND frame to /app/chat.send — handled by ChatWsController. */
  sendMessage(conversationId: string, body: string): void {
    if (!this.isBrowser) return;
    this.connect().publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ conversationId, body }),
    });
  }

  /** Closes the socket (e.g. on logout). */
  disconnect(): void {
    this.rxStomp?.deactivate();
    this.rxStomp = null;
  }

  // ── REST (state) ────────────────────────────────────────────────────────

  /** Client space: own conversation, created server-side on first call. */
  myConversation(): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.api}/conversation`, { withCredentials: true });
  }

  /** Coach inbox. */
  conversations(): Observable<ConversationSummary[]> {
    return this.http.get<ConversationSummary[]>(`${this.api}/conversations`, { withCredentials: true });
  }

  /** History page (newest first — callers reverse for display). */
  messages(conversationId: string, page = 0): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.api}/${conversationId}/messages?page=${page}`, { withCredentials: true });
  }

  markRead(conversationId: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/${conversationId}/read`, {}, { withCredentials: true });
  }
}
