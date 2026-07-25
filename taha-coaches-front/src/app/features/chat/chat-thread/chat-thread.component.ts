import {
  Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges,
  signal, ElementRef, ViewChild, AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ChatService } from '../../../core/services/chat/chat.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ChatMessage } from '../../../core/models/chat.model';

/**
 * The conversation pane: history + live messages + composer.
 * Used by both the client chat page and the coach inbox.
 */
@Component({
  selector: 'app-chat-thread',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="flex flex-col h-full">

      <!-- Messages -->
      <div #scrollPane class="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
        @if (loading()) {
          <div class="space-y-3 pt-4">
            @for (n of [1,2,3]; track n) {
              <div class="h-10 rounded-2xl bg-primary/5 dark:bg-dark-primary/5 animate-pulse"
                   [class.ml-auto]="n % 2 === 0" style="max-width: 60%"></div>
            }
          </div>
        } @else if (messages().length === 0) {
          <div class="h-full flex flex-col items-center justify-center text-center gap-2">
            <i class="bi bi-chat-dots text-3xl text-secondary/15 dark:text-dark-secondary/15"></i>
            <p class="text-sm text-secondary/40 dark:text-dark-secondary/40">
              {{ 'chat.empty' | translate }}
            </p>
          </div>
        } @else {
          @for (m of messages(); track m.id; let i = $index) {
            <!-- Day separator -->
            @if (i === 0 || (m.sentAt | date:'yMMdd') !== (messages()[i-1].sentAt | date:'yMMdd')) {
              <div class="flex items-center gap-3 py-2">
                <span class="flex-1 h-px bg-primary/8 dark:bg-dark-primary/8"></span>
                <span class="text-[10px] font-bold uppercase tracking-wider text-secondary/30 dark:text-dark-secondary/30">
                  {{ m.sentAt | date:'EEEE d MMM' }}
                </span>
                <span class="flex-1 h-px bg-primary/8 dark:bg-dark-primary/8"></span>
              </div>
            }
            <div class="flex" [class.justify-end]="isMine(m)">
              <div class="max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words"
                   [class]="isMine(m)
                     ? 'bg-primary dark:bg-dark-primary text-white dark:text-dark-background rounded-br-md'
                     : 'bg-primary/8 dark:bg-dark-primary/10 text-secondary dark:text-dark-secondary rounded-bl-md'">
                {{ m.body }}
                <span class="block text-[10px] mt-0.5 text-right"
                      [class]="isMine(m) ? 'text-white/60 dark:text-dark-background/60' : 'text-secondary/35'">
                  {{ m.sentAt | date:'HH:mm' }}
                </span>
              </div>
            </div>
          }
        }
      </div>

      <!-- Composer -->
      <div class="border-t border-primary/8 dark:border-dark-primary/8 p-3">
        <div class="flex items-end gap-2">
          <textarea [(ngModel)]="draft" rows="1"
                    (keydown.enter)="onEnter($any($event))"
                    [placeholder]="'chat.placeholder' | translate"
                    class="flex-1 resize-none rounded-2xl border border-primary/15 dark:border-dark-primary/15
                           bg-background dark:bg-dark-background text-secondary dark:text-dark-secondary
                           px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 max-h-32">
          </textarea>
          <button (click)="send()"
                  [disabled]="!draft.trim()"
                  class="w-10 h-10 rounded-full bg-primary dark:bg-dark-primary
                         text-white dark:text-dark-background flex items-center justify-center shrink-0
                         disabled:opacity-30 hover:opacity-90 transition-opacity">
            <i class="bi bi-send-fill text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ChatThreadComponent implements OnChanges, OnDestroy, AfterViewChecked {

  @Input({ required: true }) conversationId!: string;
  /** Lets parents (coach inbox) refresh their sidebar when something arrives. */
  @Output() activity = new EventEmitter<ChatMessage>();

  @ViewChild('scrollPane') scrollPane?: ElementRef<HTMLDivElement>;

  loading  = signal(true);
  messages = signal<ChatMessage[]>([]);
  draft    = '';

  private liveSub?: Subscription;
  private myId: string | null = null;
  private shouldScroll = false;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {
    this.authService.currentUser$.subscribe(u => this.myId = u?.id ?? null);
  }

  /** Re-runs whenever the parent switches conversation (coach inbox). */
  ngOnChanges(changes: SimpleChanges) {
    if (!changes['conversationId'] || !this.conversationId) return;

    this.liveSub?.unsubscribe();
    this.loading.set(true);
    this.messages.set([]);

    // 1. History over REST (newest first → reverse for display)
    this.chatService.messages(this.conversationId).subscribe({
      next: page => {
        this.messages.set([...page].reverse());
        this.loading.set(false);
        this.shouldScroll = true;
        this.chatService.markRead(this.conversationId).subscribe();
      },
      error: () => this.loading.set(false)
    });

    // 2. Live messages over the WebSocket subscription
    this.liveSub = this.chatService.watchConversation(this.conversationId)
      .subscribe(m => {
        this.messages.update(list => [...list, m]);
        this.shouldScroll = true;
        this.activity.emit(m);
        // Reading along live — mark the other side's messages as read immediately
        if (!this.isMine(m)) this.chatService.markRead(this.conversationId).subscribe();
      });
  }

  ngOnDestroy() { this.liveSub?.unsubscribe(); }

  ngAfterViewChecked() {
    if (this.shouldScroll && this.scrollPane) {
      this.scrollPane.nativeElement.scrollTop = this.scrollPane.nativeElement.scrollHeight;
      this.shouldScroll = false;
    }
  }

  isMine(m: ChatMessage): boolean { return m.senderId === this.myId; }

  onEnter(event: KeyboardEvent) {
    if (event.shiftKey) return;     // Shift+Enter = newline
    event.preventDefault();
    this.send();
  }

  send() {
    const body = this.draft.trim();
    if (!body) return;
    // Fire-and-forget over the socket; the message appears when the broker
    // echoes it back to us (which doubles as delivery confirmation).
    this.chatService.sendMessage(this.conversationId, body);
    this.draft = '';
  }
}
