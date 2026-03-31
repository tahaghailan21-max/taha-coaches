import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ReservationService } from '../../../core/services/reservation/reservation.service';
import { Reservation } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-background dark:bg-dark-background px-4 py-10">
      <div class="max-w-2xl mx-auto">

        <h1 class="text-3xl font-bold text-primary dark:text-dark-primary mb-8">
          {{ 'reservations.title' | translate }}
        </h1>

        <!-- Loading skeleton -->
        @if (loading()) {
          <div class="space-y-3">
            @for (n of [1,2,3]; track n) {
              <div class="h-24 rounded-2xl bg-primary/5 dark:bg-dark-primary/5 animate-pulse"></div>
            }
          </div>
        } @else if (reservations().length === 0) {
          <div class="text-center py-16 space-y-3">
            <div class="text-5xl">📅</div>
            <p class="text-secondary/50 dark:text-dark-secondary/50">
              {{ 'reservations.empty' | translate }}
            </p>
            <a routerLink="/book"
               class="inline-block mt-4 px-6 py-2.5 rounded-xl
                      bg-primary dark:bg-dark-primary
                      text-white dark:text-dark-background
                      text-sm font-semibold hover:opacity-90 transition-opacity">
              {{ 'booking.title' | translate }}
            </a>
          </div>
        } @else {
          <ul class="space-y-3">
            @for (r of reservations(); track r.id) {
              <li class="bg-surface dark:bg-dark-surface rounded-2xl shadow-sm p-5 space-y-3">

                <!-- Top row: date+time and status badge -->
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-bold text-secondary dark:text-dark-secondary">
                      {{ r.date }}
                    </p>
                    <p class="text-sm text-secondary/60 dark:text-dark-secondary/60">
                      {{ formatTime(r.time) }} · {{ 'booking.duration.' + r.durationMinutes | translate }}
                    </p>
                  </div>
                  <span class="text-xs font-semibold px-3 py-1 rounded-full"
                        [class]="statusClass(r.status)">
                    {{ 'reservations.status.' + r.status | translate }}
                  </span>
                </div>

                <!-- Notes -->
                @if (r.notes) {
                  <p class="text-sm text-secondary/50 dark:text-dark-secondary/50 italic border-t border-primary/10 dark:border-dark-primary/10 pt-3">
                    "{{ r.notes }}"
                  </p>
                }

                <!-- Cancel button — only for PENDING -->
                @if (r.status === 'PENDING') {
                  <div class="border-t border-primary/10 dark:border-dark-primary/10 pt-3">
                    <button (click)="cancel(r.id)"
                            [disabled]="cancelling() === r.id"
                            class="text-sm text-red-500 dark:text-red-400
                                   hover:text-red-600 dark:hover:text-red-500
                                   disabled:opacity-40 transition-colors font-medium">
                      @if (cancelling() === r.id) {
                        <i class="bi bi-arrow-repeat animate-spin mr-1"></i>
                      }
                      {{ 'reservations.cancel' | translate }}
                    </button>
                  </div>
                }
              </li>
            }
          </ul>
        }

      </div>
    </div>
  `
})
export class MyReservationsComponent implements OnInit {

  loading = signal(true);
  reservations = signal<Reservation[]>([]);
  cancelling = signal<string | null>(null); // holds the id being cancelled

  constructor(private reservationService: ReservationService) {}

  ngOnInit() {
    this.reservationService.getMyReservations().subscribe({
      next: list => {
        this.reservations.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  cancel(id: string) {
    if (!confirm('')) return; // browser confirm handled by translation key below
    this.cancelling.set(id);
    this.reservationService.cancelReservation(id).subscribe({
      next: () => {
        // Optimistic update: flip status locally, no re-fetch needed
        this.reservations.update(list =>
          list.map(r => r.id === id ? { ...r, status: 'CANCELLED' as const } : r)
        );
        this.cancelling.set(null);
      },
      error: () => this.cancelling.set(null)
    });
  }

  statusClass(status: Reservation['status']): string {
    const map: Record<Reservation['status'], string> = {
      PENDING:   'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
      APPROVED:  'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
      REJECTED:  'bg-red-100 dark:bg-red-900/20 text-red-500 dark:text-red-400',
      CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500',
    };
    return map[status] ?? '';
  }

  formatTime(t: string): string {
    return t?.slice(0, 5) ?? '';
  }
}
