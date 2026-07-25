import { Component, OnInit, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ChatService } from '../../../core/services/chat/chat.service';
import { ConversationSummary } from '../../../core/models/chat.model';
import { ChatThreadComponent } from '../chat-thread/chat-thread.component';

/**
 * Coach inbox: conversation list on the left, the open thread on the right.
 */
@Component({
  selector: 'app-admin-chat',
  standalone: true,
  imports: [CommonModule, TranslateModule, ChatThreadComponent],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="h-[calc(100vh-14rem)] min-h-[420px] grid grid-cols-1 md:grid-cols-[300px,1fr]
                  bg-surface dark:bg-dark-surface rounded-3xl shadow-sm overflow-hidden">

        <!-- Conversation list -->
        <div class="border-r border-primary/8 dark:border-dark-primary/8 flex flex-col min-h-0"
             [class.hidden]="selected() && isMobile" [class.md:flex]="true">
          <div class="px-4 py-3.5 border-b border-primary/8 dark:border-dark-primary/8">
            <p class="text-xs font-bold uppercase tracking-wider text-secondary/40 dark:text-dark-secondary/40">
              {{ 'chat.conversations' | translate }}
            </p>
          </div>
          <div class="flex-1 overflow-y-auto">
            @if (loading()) {
              <div class="p-3 space-y-2">
                @for (n of [1,2,3]; track n) {
                  <div class="h-14 rounded-xl bg-primary/5 dark:bg-dark-primary/5 animate-pulse"></div>
                }
              </div>
            } @else if (summaries().length === 0) {
              <div class="py-12 text-center px-4">
                <i class="bi bi-inbox text-3xl text-secondary/15 dark:text-dark-secondary/15"></i>
                <p class="mt-2 text-sm text-secondary/40 dark:text-dark-secondary/40">
                  {{ 'chat.noConversations' | translate }}
                </p>
              </div>
            } @else {
              @for (s of summaries(); track s.id) {
                <button (click)="select(s)"
                        class="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                               border-b border-primary/5 dark:border-dark-primary/5"
                        [class]="selected()?.id === s.id
                          ? 'bg-primary/8 dark:bg-dark-primary/8'
                          : 'hover:bg-primary/[0.03] dark:hover:bg-dark-primary/[0.03]'">
                  @if (s.clientAvatar) {
                    <img [src]="s.clientAvatar" class="w-10 h-10 rounded-full object-cover shrink-0">
                  } @else {
                    <div class="w-10 h-10 rounded-full bg-primary/10 dark:bg-dark-primary/10 shrink-0
                                flex items-center justify-center text-primary dark:text-dark-primary text-xs font-bold">
                      {{ initials(s.clientName) }}
                    </div>
                  }
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                      <p class="font-semibold text-secondary dark:text-dark-secondary text-sm truncate">
                        {{ s.clientName ?? 'Client' }}
                      </p>
                      @if (s.lastMessageAt) {
                        <span class="text-[10px] text-secondary/35 shrink-0">
                          {{ s.lastMessageAt | date:'d MMM' }}
                        </span>
                      }
                    </div>
                    <div class="flex items-center justify-between gap-2">
                      <p class="text-xs text-secondary/40 dark:text-dark-secondary/40 truncate">
                        {{ s.lastMessageBody ?? '—' }}
                      </p>
                      @if (s.unreadCount > 0) {
                        <span class="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-primary dark:bg-dark-primary
                                     text-white dark:text-dark-background text-[10px] font-bold
                                     flex items-center justify-center">
                          {{ s.unreadCount }}
                        </span>
                      }
                    </div>
                  </div>
                </button>
              }
            }
          </div>
        </div>

        <!-- Thread -->
        <div class="flex flex-col min-h-0">
          @if (selected()) {
            <div class="flex items-center gap-3 px-4 py-3 border-b border-primary/8 dark:border-dark-primary/8">
              <button (click)="selected.set(null)" class="md:hidden p-1 text-secondary/50">
                <i class="bi bi-arrow-left"></i>
              </button>
              <p class="font-bold text-secondary dark:text-dark-secondary text-sm">
                {{ selected()!.clientName ?? 'Client' }}
              </p>
            </div>
            <app-chat-thread class="flex-1 min-h-0"
                             [conversationId]="selected()!.id"
                             (activity)="refreshSummaries()"></app-chat-thread>
          } @else {
            <div class="flex-1 hidden md:flex flex-col items-center justify-center gap-3 text-center">
              <i class="bi bi-chat-square-text text-4xl text-secondary/10 dark:text-dark-secondary/10"></i>
              <p class="text-sm text-secondary/40 dark:text-dark-secondary/40">
                {{ 'chat.selectConversation' | translate }}
              </p>
            </div>
          }
        </div>

      </div>
    </div>
  `
})
export class AdminChatComponent implements OnInit {

  loading   = signal(true);
  summaries = signal<ConversationSummary[]>([]);
  selected  = signal<ConversationSummary | null>(null);

  readonly isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  private readonly isBrowser: boolean;

  constructor(
    private chatService: ChatService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) return;
    this.refreshSummaries();
  }

  refreshSummaries() {
    this.chatService.conversations().subscribe({
      next: list => {
        this.summaries.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  select(s: ConversationSummary) {
    this.selected.set(s);
    // Optimistically clear the badge; the thread marks messages read server-side.
    this.summaries.update(list =>
      list.map(x => x.id === s.id ? { ...x, unreadCount: 0 } : x));
  }

  initials(name: string | null): string {
    if (!name) return '?';
    return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  }
}
