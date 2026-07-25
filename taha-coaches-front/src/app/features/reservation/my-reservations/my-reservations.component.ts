import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule }    from '@angular/router';
import { Subscription }    from 'rxjs';
import { ReservationService }             from '../../../core/services/reservation/reservation.service';
import { Reservation, ReservationStatus } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  template: `
    <div class="min-h-screen bg-background dark:bg-dark-background px-4 py-10">
      <div class="max-w-3xl mx-auto space-y-8">

        <!-- Header -->
        <div class="flex items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-primary dark:text-dark-primary">
              {{ 'reservations.title' | translate }}
            </h1>
            <p class="text-sm text-secondary/60 dark:text-dark-secondary/60 mt-1">
              {{ 'reservations.subtitle' | translate }}
            </p>
          </div>
          <a routerLink="/book"
             class="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl
                    bg-primary dark:bg-dark-primary text-white dark:text-dark-background
                    text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
            <i class="bi bi-plus-lg"></i>
            <span class="hidden sm:inline">{{ 'navbar.book' | translate }}</span>
          </a>
        </div>

        @if (loading()) {
          <div class="space-y-3">
            @for (n of [1,2,3]; track n) {
              <div class="h-24 rounded-2xl bg-surface dark:bg-dark-surface animate-pulse"></div>
            }
          </div>
        } @else if (rawList().length === 0) {
          <!-- Empty state -->
          <div class="bg-surface dark:bg-dark-surface rounded-3xl p-12 text-center shadow-sm space-y-4">
            <div class="w-16 h-16 rounded-2xl bg-primary/8 dark:bg-dark-primary/8
                        flex items-center justify-center mx-auto">
              <i class="bi bi-calendar2-plus text-3xl text-primary/40 dark:text-dark-primary/40"></i>
            </div>
            <p class="text-sm text-secondary/50 dark:text-dark-secondary/50">
              {{ 'reservations.noReservations' | translate }}
            </p>
            <a routerLink="/book"
               class="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                      bg-primary dark:bg-dark-primary text-white dark:text-dark-background
                      text-sm font-semibold hover:opacity-90 transition-opacity">
              <i class="bi bi-calendar-plus"></i>
              {{ 'navbar.book' | translate }}
            </a>
          </div>
        } @else {

          <!-- UPCOMING -->
          <section class="space-y-3">
            <h2 class="text-xs font-bold uppercase tracking-wider text-secondary/40 dark:text-dark-secondary/40">
              {{ 'reservations.upcoming' | translate }}
              @if (upcoming().length > 0) {
                <span class="ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 dark:bg-dark-primary/10
                             text-primary dark:text-dark-primary">{{ upcoming().length }}</span>
              }
            </h2>

            @if (upcoming().length === 0) {
              <div class="bg-surface dark:bg-dark-surface rounded-2xl p-6 text-center shadow-sm">
                <p class="text-sm text-secondary/40 dark:text-dark-secondary/40">
                  {{ 'reservations.noUpcoming' | translate }}
                  <a routerLink="/book" class="text-primary dark:text-dark-primary font-semibold underline ml-1">
                    {{ 'navbar.book' | translate }}
                  </a>
                </p>
              </div>
            }

            @for (r of upcoming(); track r.id) {
              <div class="relative bg-surface dark:bg-dark-surface rounded-2xl shadow-sm px-5 py-4 pl-6
                          flex flex-col sm:flex-row sm:items-center gap-4 overflow-hidden">
                <!-- Status stripe -->
                <span class="absolute left-0 top-0 bottom-0 w-1.5" [class]="stripeClass(r.status)"></span>

                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <div class="flex flex-col items-center justify-center w-14 h-14 rounded-xl
                              bg-primary/10 dark:bg-dark-primary/10 shrink-0">
                    <span class="text-[10px] font-bold uppercase text-primary dark:text-dark-primary leading-none">
                      {{ r.date | date:'MMM' }}
                    </span>
                    <span class="text-xl font-bold text-primary dark:text-dark-primary leading-tight">
                      {{ r.date | date:'d' }}
                    </span>
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-secondary dark:text-dark-secondary text-sm">
                      {{ r.startTime.slice(0,5) }} – {{ r.endTime.slice(0,5) }}
                      <span class="ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full
                                   bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary">
                        {{ r.durationMinutes }} min
                      </span>
                    </p>
                    <p class="text-xs text-secondary/40 mt-0.5">
                      {{ r.date | date:'EEEE d MMMM' }} · {{ relativeLabel(r.date) }}
                    </p>
                    @if (r.notes) {
                      <p class="text-xs text-secondary/50 mt-1 truncate">
                        <i class="bi bi-chat-left-text mr-1"></i>{{ r.notes }}
                      </p>
                    }
                  </div>
                </div>

                <div class="flex items-center gap-3 shrink-0">
                  <span class="px-3 py-1 rounded-full text-xs font-bold" [class]="statusClass(r.status)">
                    {{ ('reservations.status.' + r.status) | translate }}
                  </span>
                  <button (click)="requestCancel(r)"
                          class="px-3 py-1.5 rounded-lg text-xs font-semibold
                                 bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400
                                 hover:bg-red-100 transition-colors">
                    <i class="bi bi-x-circle mr-1"></i>{{ 'reservations.cancel' | translate }}
                  </button>
                </div>
              </div>
            }
          </section>

          <!-- HISTORY -->
          @if (history().length > 0) {
            <section class="space-y-3">
              <button (click)="showHistory.set(!showHistory())"
                      class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider
                             text-secondary/40 dark:text-dark-secondary/40 hover:text-secondary/70 transition-colors">
                {{ 'reservations.history' | translate }}
                <span class="px-1.5 py-0.5 rounded-full bg-primary/5 dark:bg-dark-primary/5">{{ history().length }}</span>
                <i class="bi text-sm" [class]="showHistory() ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              </button>

              @if (showHistory()) {
                <div class="bg-surface dark:bg-dark-surface rounded-2xl shadow-sm
                            divide-y divide-primary/5 dark:divide-dark-primary/5">
                  @for (r of history(); track r.id) {
                    <div class="flex items-center justify-between gap-3 px-5 py-3.5">
                      <div class="min-w-0">
                        <p class="text-sm font-semibold text-secondary/70 dark:text-dark-secondary/70">
                          {{ r.date | date:'d MMM y' }} · {{ r.startTime.slice(0,5) }}
                        </p>
                        @if (r.notes) {
                          <p class="text-xs text-secondary/35 truncate mt-0.5">{{ r.notes }}</p>
                        }
                      </div>
                      <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0"
                            [class]="statusClass(r.status)">
                        {{ ('reservations.status.' + r.status) | translate }}
                      </span>
                    </div>
                  }
                </div>
              }
            </section>
          }
        }

      </div>
    </div>

    <!-- Confirm cancel dialog -->
    @if (cancelTarget()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center px-4"
           (click)="cancelTarget.set(null)">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="relative z-50 bg-surface dark:bg-dark-surface rounded-2xl shadow-2xl p-6 max-w-sm w-full"
             (click)="$event.stopPropagation()">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30
                        flex items-center justify-center shrink-0">
              <i class="bi bi-x-circle text-red-500 dark:text-red-400"></i>
            </div>
            <div>
              <h3 class="font-bold text-secondary dark:text-dark-secondary">
                {{ 'reservations.cancelTitle' | translate }}
              </h3>
              <p class="text-sm text-secondary/60 mt-1 leading-relaxed">
                {{ 'reservations.cancelBody' | translate }}
              </p>
            </div>
          </div>
          <div class="flex gap-3 mt-6 justify-end">
            <button (click)="cancelTarget.set(null)"
                    class="px-4 py-2 rounded-xl border border-primary/20 text-secondary dark:text-dark-secondary
                           text-sm font-semibold hover:bg-primary/5 transition-colors">
              {{ 'reservations.keepIt' | translate }}
            </button>
            <button (click)="confirmCancel()"
                    class="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
              <i class="bi bi-x-circle mr-1"></i> {{ 'reservations.yesCancel' | translate }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class MyReservationsComponent implements OnInit, OnDestroy {

  loading      = signal(true);
  showHistory  = signal(false);
  cancelTarget = signal<Reservation | null>(null);

  rawList = signal<Reservation[]>([]);
  private sub!: Subscription;

  private readonly todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();

  /** Active (PENDING/APPROVED) sessions today or later, soonest first. */
  upcoming = computed<Reservation[]>(() =>
    this.rawList()
      .filter(r => (r.status === 'PENDING' || r.status === 'APPROVED') && r.date >= this.todayStr)
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
  );

  /** Everything else: past or terminal states, most recent first. */
  history = computed<Reservation[]>(() => {
    const up = new Set(this.upcoming().map(r => r.id));
    return this.rawList()
      .filter(r => !up.has(r.id))
      .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));
  });

  constructor(private reservationService: ReservationService) {}

  ngOnInit() {
    this.sub = this.reservationService.reservations$.subscribe(list => {
      this.rawList.set(list); this.loading.set(false);
    });
    this.reservationService.loadMine();
  }
  ngOnDestroy() { this.sub?.unsubscribe(); }

  relativeLabel(date: string): string {
    const target = new Date(date + 'T00:00:00');
    const today  = new Date(); today.setHours(0,0,0,0);
    const days = Math.round((target.getTime() - today.getTime()) / 86_400_000);
    if (days === 0) return 'today';
    if (days === 1) return 'tomorrow';
    return `in ${days} days`;
  }

  requestCancel(r: Reservation) { this.cancelTarget.set(r); }
  confirmCancel() {
    const r = this.cancelTarget(); if (!r) return;
    this.cancelTarget.set(null);
    this.reservationService.cancel(r.id).subscribe();
  }

  stripeClass(status: ReservationStatus): string {
    return status === 'APPROVED' ? 'bg-green-400' : 'bg-orange-400';
  }

  statusClass(status: ReservationStatus): string {
    const map: Record<ReservationStatus, string> = {
      PENDING:   'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      APPROVED:  'bg-green-100  dark:bg-green-900/20  text-green-700  dark:text-green-400',
      DECLINED:  'bg-red-100    dark:bg-red-900/20    text-red-600    dark:text-red-400',
      CANCELLED: 'bg-gray-100   dark:bg-gray-800       text-gray-400',
      COMPLETED: 'bg-blue-100   dark:bg-blue-900/20   text-blue-700   dark:text-blue-400',
    };
    return map[status] ?? '';
  }
}
