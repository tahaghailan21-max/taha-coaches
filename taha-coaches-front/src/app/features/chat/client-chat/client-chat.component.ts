import { Component, OnInit, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ChatService } from '../../../core/services/chat/chat.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ChatThreadComponent } from '../chat-thread/chat-thread.component';

/**
 * Client space: the conversation with the coach.
 * The conversation is created server-side on first visit.
 */
@Component({
  selector: 'app-client-chat',
  standalone: true,
  imports: [CommonModule, TranslateModule, ChatThreadComponent],
  template: `
    <div class="min-h-screen bg-background dark:bg-dark-background px-4 py-8">
      <div class="max-w-2xl mx-auto h-[calc(100vh-8rem)] flex flex-col
                  bg-surface dark:bg-dark-surface rounded-3xl shadow-sm overflow-hidden">

        <!-- Header -->
        <div class="flex items-center gap-3 px-5 py-4 border-b border-primary/8 dark:border-dark-primary/8">
          <div class="relative">
            <img src="/assets/cropped-avatar1.jpeg" alt="Coach"
                 class="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20">
          </div>
          <div>
            <p class="font-bold text-secondary dark:text-dark-secondary text-sm leading-tight">
              {{ 'chat.coach' | translate }}
            </p>
            <p class="text-xs text-secondary/40 dark:text-dark-secondary/40">
              {{ 'chat.subtitle' | translate }}
            </p>
          </div>
        </div>

        @if (conversationId()) {
          <app-chat-thread class="flex-1 min-h-0" [conversationId]="conversationId()!"></app-chat-thread>
        } @else {
          <div class="flex-1 flex items-center justify-center">
            <div class="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
          </div>
        }
      </div>
    </div>
  `
})
export class ClientChatComponent implements OnInit {

  conversationId = signal<string | null>(null);
  private readonly isBrowser: boolean;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngOnInit() {
    if (!this.isBrowser) return;   // skip during SSR/prerender
    // The coach answers from the inbox — this page is the client side only.
    const user = await this.authService.getCurrentUser();
    if (user?.role === 'ADMIN') {
      this.router.navigate(['/admin/chat']);
      return;
    }
    this.chatService.myConversation().subscribe({
      next: c => this.conversationId.set(c.id)
    });
  }
}
