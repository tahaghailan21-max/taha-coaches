import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ReservationService } from '../../../core/services/reservation/reservation.service';

/**
 * Shell for the admin area: a slim header with tab navigation and a
 * router-outlet. Routes: /admin/reservations and /admin/availability.
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-background dark:bg-dark-background">

      <!-- Admin header -->
      <div class="bg-surface dark:bg-dark-surface border-b border-primary/10 dark:border-dark-primary/10">
        <div class="max-w-6xl mx-auto px-4 pt-6 pb-0">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-9 h-9 rounded-xl bg-primary dark:bg-dark-primary
                        flex items-center justify-center">
              <i class="bi bi-shield-lock text-white dark:text-dark-background"></i>
            </div>
            <div>
              <h1 class="text-xl font-bold text-secondary dark:text-dark-secondary leading-tight">
                {{ 'admin.title' | translate }}
              </h1>
              <p class="text-xs text-secondary/40 dark:text-dark-secondary/40">
                {{ 'admin.subtitle' | translate }}
              </p>
            </div>
          </div>

          <!-- Tabs -->
          <nav class="flex gap-1">
            <a routerLink="/admin/reservations" routerLinkActive="admin-tab-active"
               class="admin-tab">
              <i class="bi bi-calendar-check mr-1.5"></i>
              {{ 'admin.tab.reservations' | translate }}
              @if (pendingCount() > 0) {
                <span class="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white">
                  {{ pendingCount() }}
                </span>
              }
            </a>
            <a routerLink="/admin/availability" routerLinkActive="admin-tab-active"
               class="admin-tab">
              <i class="bi bi-clock-history mr-1.5"></i>
              {{ 'admin.tab.availability' | translate }}
            </a>
            <a routerLink="/admin/chat" routerLinkActive="admin-tab-active"
               class="admin-tab">
              <i class="bi bi-chat-dots mr-1.5"></i>
              {{ 'admin.tab.chat' | translate }}
            </a>
          </nav>
        </div>
      </div>

      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .admin-tab {
      display: inline-flex;
      align-items: center;
      padding: 0.65rem 1.1rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: rgb(100 100 100 / 0.6);
      border-bottom: 2px solid transparent;
      border-radius: 0.5rem 0.5rem 0 0;
      transition: all .15s ease;
    }
    .admin-tab:hover { color: rgb(100 100 100); background: rgb(0 0 0 / 0.03); }
    .admin-tab-active {
      color: var(--tw-prose-links, #1a1a1a);
      border-bottom-color: currentColor;
    }
    :host-context(.dark) .admin-tab { color: rgb(200 200 200 / 0.5); }
    :host-context(.dark) .admin-tab:hover { color: rgb(220 220 220); background: rgb(255 255 255 / 0.04); }
    :host-context(.dark) .admin-tab-active { color: rgb(240 240 240); }
  `]
})
export class AdminLayoutComponent implements OnInit, OnDestroy {

  pendingCount = signal(0);
  private sub!: Subscription;

  constructor(private reservationService: ReservationService) {}

  ngOnInit() {
    this.sub = this.reservationService.reservations$.subscribe(list => {
      this.pendingCount.set(list.filter(r => r.status === 'PENDING').length);
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }
}
