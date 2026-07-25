import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { FormsModule }     from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule }    from '@angular/router';
import { SessionTypeService }   from '../../../core/services/session-type/session-type.service';
import { BookingService }       from '../../../core/services/booking/booking.service';
import { ReservationService }   from '../../../core/services/reservation/reservation.service';
import { AuthService }          from '../../../core/services/auth/auth.service';
import { SessionType }          from '../../../core/models/session-type.model';
import { TimeRange }            from '../../../core/models/reservation.model';

interface CalendarDay {
  date:           string;
  dayNumber:      number;
  isCurrentMonth: boolean;
  isPast:         boolean;
  isToday:        boolean;
  freeCount:      number;
}

/**
 * Calendly-style booking flow:
 *   type pills on top → month calendar (left) → slots for the picked day (right)
 *   → inline confirm step in the right panel.
 */
@Component({
  selector:    'app-make-reservation',
  standalone:  true,
  imports:     [CommonModule, FormsModule, TranslateModule, RouterModule],
  template: `
    <div class="min-h-screen bg-background dark:bg-dark-background px-4 py-10">
      <div class="max-w-4xl mx-auto space-y-5">

        <!-- HEADER -->
        <div class="text-center">
          <h1 class="text-3xl font-bold text-primary dark:text-dark-primary">
            {{ 'booking.title' | translate }}
          </h1>
          <p class="text-sm text-secondary/50 dark:text-dark-secondary/50 mt-1">
            {{ 'booking.subtitle' | translate }}
          </p>
        </div>

        <!-- SUCCESS STATE -->
        @if (showSuccess()) {
          <div class="bg-surface dark:bg-dark-surface rounded-3xl shadow-sm p-10 text-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30
                        flex items-center justify-center mx-auto">
              <i class="bi bi-check-lg text-3xl text-green-600 dark:text-green-400"></i>
            </div>
            <h2 class="text-xl font-bold text-secondary dark:text-dark-secondary">
              {{ 'booking.success.title' | translate }}
            </h2>
            <p class="text-sm text-secondary/60 dark:text-dark-secondary/60 max-w-sm mx-auto">
              {{ 'booking.success.body' | translate }}
            </p>
            @if (bookedSummary()) {
              <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full
                          bg-primary/8 dark:bg-dark-primary/8 text-primary dark:text-dark-primary
                          text-sm font-semibold">
                <i class="bi bi-calendar3"></i>
                {{ bookedSummary()!.date | date:'EEEE d MMMM y' }} ·
                {{ bookedSummary()!.startTime.slice(0,5) }}–{{ bookedSummary()!.endTime.slice(0,5) }}
              </div>
            }
            <div class="flex flex-col sm:flex-row gap-3 justify-center pt-3">
              <a routerLink="/my-reservations"
                 class="px-6 py-3 rounded-xl bg-primary dark:bg-dark-primary
                        text-white dark:text-dark-background text-sm font-semibold
                        hover:opacity-90 transition-opacity text-center">
                <i class="bi bi-calendar-check mr-1.5"></i>
                {{ 'navbar.myReservations' | translate }}
              </a>
              <button (click)="resetAll()"
                      class="px-6 py-3 rounded-xl bg-primary/10 dark:bg-dark-primary/10
                             text-primary dark:text-dark-primary text-sm font-semibold hover:bg-primary/20 transition-colors">
                {{ 'booking.success.again' | translate }}
              </button>
            </div>
          </div>
        }

        @if (!showSuccess()) {

          <!-- SESSION TYPE PILLS -->
          <div class="flex flex-wrap justify-center gap-2">
            @if (sessionTypes().length === 0) {
              <div class="h-12 w-80 rounded-full bg-surface dark:bg-dark-surface animate-pulse"></div>
            }
            @for (st of sessionTypes(); track st.id) {
              <button (click)="selectType(st)"
                      class="group flex items-center gap-2.5 px-5 py-2.5 rounded-full border-2 transition-all duration-200"
                      [class]="selectedType()?.id === st.id
                        ? 'border-primary dark:border-dark-primary bg-primary dark:bg-dark-primary text-white dark:text-dark-background shadow-md'
                        : 'border-primary/15 dark:border-dark-primary/15 bg-surface dark:bg-dark-surface text-secondary dark:text-dark-secondary hover:border-primary/50 hover:shadow-sm'">
                <span class="font-semibold text-sm">
                  {{ ('sessionType.' + st.code + '.name') | translate }}
                </span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      [class]="selectedType()?.id === st.id
                        ? 'bg-white/20 dark:bg-dark-background/20'
                        : 'bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary'">
                  {{ st.durationMinutes }} min
                </span>
              </button>
            }
          </div>
          @if (selectedType()) {
            <p class="text-center text-xs text-secondary/40 dark:text-dark-secondary/40 -mt-2">
              {{ ('sessionType.' + selectedType()!.code + '.description') | translate }}
            </p>
          }

          <!-- TWO-PANEL CARD -->
          @if (selectedType()) {
            <div class="bg-surface dark:bg-dark-surface rounded-3xl shadow-sm overflow-hidden
                        grid grid-cols-1 md:grid-cols-[1.2fr,1fr]">

              <!-- LEFT: MONTH CALENDAR -->
              <div class="p-6 md:border-r border-primary/8 dark:border-dark-primary/8">

                <!-- Month nav -->
                <div class="flex items-center justify-between mb-4">
                  <button (click)="shiftMonth(-1)" [disabled]="isCurrentMonthNow()"
                          class="w-9 h-9 rounded-full flex items-center justify-center
                                 text-secondary dark:text-dark-secondary
                                 hover:bg-primary/8 dark:hover:bg-dark-primary/8 transition-colors
                                 disabled:opacity-20 disabled:pointer-events-none">
                    <i class="bi bi-chevron-left"></i>
                  </button>
                  <span class="font-bold text-secondary dark:text-dark-secondary">{{ monthLabel() }}</span>
                  <button (click)="shiftMonth(1)"
                          class="w-9 h-9 rounded-full flex items-center justify-center
                                 text-secondary dark:text-dark-secondary
                                 hover:bg-primary/8 dark:hover:bg-dark-primary/8 transition-colors">
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </div>

                <!-- Day headers -->
                <div class="grid grid-cols-7 mb-1">
                  @for (h of DAY_HEADERS; track h) {
                    <div class="text-center text-[11px] font-bold uppercase tracking-wide
                                text-secondary/35 dark:text-dark-secondary/35 py-1">{{ h }}</div>
                  }
                </div>

                <!-- Day grid -->
                @if (loadingMonth()) {
                  <div class="grid grid-cols-7 gap-1.5">
                    @for (n of SKELETON_DAYS; track $index) {
                      <div class="aspect-square rounded-full bg-primary/5 dark:bg-dark-primary/5 animate-pulse"></div>
                    }
                  </div>
                } @else {
                  <div class="grid grid-cols-7 gap-1.5">
                    @for (day of calendarDays(); track day.date) {
                      <button (click)="selectDay(day)"
                              [disabled]="!isBookable(day)"
                              class="relative aspect-square rounded-full flex items-center justify-center
                                     text-sm font-semibold transition-all duration-150"
                              [ngClass]="dayClasses(day)">
                        {{ day.isCurrentMonth ? day.dayNumber : '' }}
                        @if (isBookable(day) && selectedDate() !== day.date) {
                          <span class="absolute bottom-1 w-1 h-1 rounded-full bg-primary dark:bg-dark-primary"></span>
                        }
                      </button>
                    }
                  </div>
                }

                <p class="mt-4 text-[11px] text-secondary/35 dark:text-dark-secondary/35 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-primary/20 dark:bg-dark-primary/20 inline-block"></span>
                  {{ 'booking.legend.available' | translate }}
                </p>
              </div>

              <!-- RIGHT: DAY DETAIL -->
              <div class="p-6 bg-primary/[0.015] dark:bg-dark-primary/[0.015] min-h-[380px] flex flex-col">

                <!-- No day picked yet -->
                @if (!selectedDate()) {
                  <div class="flex-1 flex flex-col items-center justify-center text-center gap-3 py-10">
                    <div class="w-14 h-14 rounded-2xl bg-primary/8 dark:bg-dark-primary/8
                                flex items-center justify-center">
                      <i class="bi bi-calendar2-week text-2xl text-primary/50 dark:text-dark-primary/50"></i>
                    </div>
                    <p class="text-sm text-secondary/40 dark:text-dark-secondary/40 max-w-[200px]">
                      {{ 'booking.pickDayHint' | translate }}
                    </p>
                  </div>
                }

                @if (selectedDate()) {
                  <!-- Day header -->
                  <div class="mb-4">
                    <p class="font-bold text-secondary dark:text-dark-secondary">
                      {{ selectedDate()! | date:'EEEE d MMMM' }}
                    </p>
                    <p class="text-xs text-secondary/40 dark:text-dark-secondary/40 mt-0.5">
                      {{ ('sessionType.' + selectedType()!.code + '.name') | translate }} ·
                      {{ selectedType()!.durationMinutes }} min
                    </p>
                  </div>

                  <!-- CONFIRM STEP -->
                  @if (selectedTime()) {
                    <div class="space-y-4 animate-fade-in">
                      <div class="flex items-center gap-3 p-3.5 rounded-2xl
                                  bg-primary/8 dark:bg-dark-primary/8">
                        <div class="w-10 h-10 rounded-xl bg-primary dark:bg-dark-primary
                                    flex items-center justify-center shrink-0">
                          <i class="bi bi-clock text-white dark:text-dark-background"></i>
                        </div>
                        <div class="flex-1">
                          <p class="font-bold text-secondary dark:text-dark-secondary text-sm">
                            {{ selectedTime()!.startTime.slice(0,5) }} – {{ selectedTime()!.endTime.slice(0,5) }}
                          </p>
                          <p class="text-xs text-secondary/45 dark:text-dark-secondary/45">
                            {{ selectedDate()! | date:'d MMM y' }} · {{ selectedType()!.durationMinutes }} min
                          </p>
                        </div>
                        <button (click)="selectedTime.set(null)"
                                class="text-xs text-secondary/50 hover:text-secondary underline shrink-0">
                          {{ 'booking.change' | translate }}
                        </button>
                      </div>

                      <textarea [(ngModel)]="notes" rows="3"
                                [placeholder]="'booking.notesPlaceholder' | translate"
                                class="w-full rounded-xl border border-primary/15 dark:border-dark-primary/15
                                       bg-surface dark:bg-dark-surface text-secondary dark:text-dark-secondary
                                       px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20">
                      </textarea>

                      <p class="text-[11px] text-secondary/40 dark:text-dark-secondary/40 leading-relaxed">
                        <i class="bi bi-info-circle mr-1"></i>{{ 'booking.pendingNotice' | translate }}
                      </p>

                      @if (!isLoggedIn()) {
                        <div class="flex items-center gap-2.5 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/10
                                     border border-orange-200 dark:border-orange-800/30">
                          <i class="bi bi-lock text-orange-500"></i>
                          <p class="text-xs text-orange-700 dark:text-orange-400">
                            {{ 'booking.loginRequired' | translate }}
                            <a routerLink="/login" class="underline font-semibold">{{ 'navbar.login' | translate }}</a>
                          </p>
                        </div>
                      }

                      @if (bookingError()) {
                        <p class="text-xs text-red-500 flex items-center gap-1.5">
                          <i class="bi bi-exclamation-circle"></i>{{ bookingError() }}
                        </p>
                      }

                      <button (click)="confirmBooking()"
                              [disabled]="saving() || !isLoggedIn()"
                              class="w-full py-3.5 rounded-xl bg-primary dark:bg-dark-primary
                                     text-white dark:text-dark-background text-sm font-bold
                                     disabled:opacity-40 hover:opacity-90 transition-opacity shadow-sm">
                        @if (saving()) { <i class="bi bi-hourglass-split mr-2 animate-spin"></i> }
                        {{ 'booking.confirm' | translate }}
                      </button>
                    </div>
                  }

                  <!-- SLOT LIST -->
                  @if (!selectedTime()) {
                    @if (loadingDay()) {
                      <div class="space-y-2">
                        @for (n of [1,2,3,4]; track n) {
                          <div class="h-12 rounded-xl bg-primary/5 dark:bg-dark-primary/5 animate-pulse"></div>
                        }
                      </div>
                    } @else if (dailyTimes().length === 0) {
                      <div class="flex-1 flex flex-col items-center justify-center text-center gap-2 py-8">
                        <i class="bi bi-calendar-x text-3xl text-secondary/15 dark:text-dark-secondary/15"></i>
                        <p class="text-sm text-secondary/40">{{ 'booking.noSlots' | translate }}</p>
                        <p class="text-xs text-secondary/25">{{ 'booking.noSlotsTip' | translate }}</p>
                      </div>
                    } @else {
                      <div class="space-y-2 overflow-y-auto max-h-[420px] pr-1 -mr-1">
                        @for (t of dailyTimes(); track t.startTime) {
                          <button (click)="selectTime(t)"
                                  class="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2
                                         border-primary/15 dark:border-dark-primary/15
                                         text-secondary dark:text-dark-secondary
                                         hover:border-primary dark:hover:border-dark-primary
                                         hover:bg-primary/5 dark:hover:bg-dark-primary/5
                                         font-semibold text-sm transition-all duration-150 group">
                            <span>{{ t.startTime.slice(0,5) }}</span>
                            <span class="text-xs font-normal text-secondary/35 dark:text-dark-secondary/35
                                         group-hover:text-primary dark:group-hover:text-dark-primary transition-colors">
                              → {{ t.endTime.slice(0,5) }}
                              <i class="bi bi-arrow-right ml-1 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                            </span>
                          </button>
                        }
                      </div>
                    }
                  }
                }
              </div>
            </div>
          }

          <!-- Nothing selected yet: tiny hint -->
          @if (!selectedType() && sessionTypes().length > 0) {
            <p class="text-center text-xs text-secondary/35 dark:text-dark-secondary/35">
              {{ 'booking.pickTypeHint' | translate }}
            </p>
          }
        }

      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    .animate-fade-in { animation: fade-in .2s ease-out; }
  `]
})
export class MakeReservationComponent implements OnInit {

  readonly DAY_HEADERS   = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  readonly SKELETON_DAYS = Array.from({ length: 35 });
  readonly MONTHS = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];

  private readonly today = (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();
  readonly todayStr      = this.toDateStr(new Date());

  currentYear  = signal(new Date().getFullYear());
  currentMonth = signal(new Date().getMonth());   // 0-based

  selectedType = signal<SessionType | null>(null);
  selectedDate = signal<string | null>(null);
  selectedTime = signal<TimeRange | null>(null);

  notes         = '';
  loadingMonth  = signal(false);
  loadingDay    = signal(false);
  saving        = signal(false);
  bookingError  = signal<string | null>(null);
  showSuccess   = signal(false);
  bookedSummary = signal<{ date: string; startTime: string; endTime: string } | null>(null);

  sessionTypes = signal<SessionType[]>([]);
  isLoggedIn   = signal(false);

  private freeCounts = signal<Record<string, number>>({});
  dailyTimes         = signal<TimeRange[]>([]);

  monthLabel = computed(() =>
    this.MONTHS[this.currentMonth()] + ' ' + this.currentYear()
  );

  calendarDays = computed<CalendarDay[]>(() => {
    const year  = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const cursor   = new Date(firstDay);
    const dow = cursor.getDay();
    cursor.setDate(cursor.getDate() - (dow === 0 ? 6 : dow - 1));
    const days: CalendarDay[] = [];
    const counts = this.freeCounts();
    while (cursor <= lastDay || days.length % 7 !== 0) {
      if (days.length >= 42) break;
      const dateStr   = this.toDateStr(cursor);
      const cursorDay = new Date(cursor); cursorDay.setHours(0,0,0,0);
      days.push({
        date:           dateStr,
        dayNumber:      cursor.getDate(),
        isCurrentMonth: cursor.getMonth() === month,
        isPast:         cursorDay < this.today,
        isToday:        dateStr === this.todayStr,
        freeCount:      counts[dateStr] ?? 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  });

  constructor(
    private sessionTypeService: SessionTypeService,
    private bookingService:     BookingService,
    private reservationService: ReservationService,
    private authService:        AuthService
  ) {}

  ngOnInit() {
    this.sessionTypeService.types$.subscribe(types => {
      this.sessionTypes.set(types);
      // Pre-select the first type so the calendar is visible immediately.
      if (!this.selectedType() && types.length > 0) this.selectType(types[0]);
    });
    if (this.sessionTypeService.snapshot.length === 0) this.sessionTypeService.load();
    this.authService.currentUser$.subscribe(u => this.isLoggedIn.set(!!u));
  }

  // ── Selection ─────────────────────────────────────────────────────────────

  selectType(st: SessionType) {
    if (this.selectedType()?.id === st.id) return;
    this.selectedType.set(st);
    this.selectedTime.set(null);
    this.bookingError.set(null);
    this.loadMonth();
    // Refresh the open day for the new duration
    if (this.selectedDate()) this.loadDay();
  }

  selectDay(day: CalendarDay) {
    if (!this.isBookable(day)) return;
    this.selectedDate.set(day.date);
    this.selectedTime.set(null);
    this.bookingError.set(null);
    this.loadDay();
  }

  selectTime(t: TimeRange) {
    this.selectedTime.set(t);
    this.bookingError.set(null);
  }

  isBookable(day: CalendarDay): boolean {
    return day.isCurrentMonth && !day.isPast && day.freeCount > 0;
  }

  dayClasses(day: CalendarDay): Record<string, boolean> {
    const selected = this.selectedDate() === day.date;
    const bookable = this.isBookable(day);
    return {
      'invisible': !day.isCurrentMonth,
      'bg-primary dark:bg-dark-primary text-white dark:text-dark-background shadow-md scale-105': selected,
      'bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary hover:bg-primary/20 dark:hover:bg-dark-primary/20 hover:scale-105 cursor-pointer': bookable && !selected,
      'text-secondary/25 dark:text-dark-secondary/25 cursor-default': !bookable && day.isCurrentMonth,
      'ring-2 ring-primary/40 dark:ring-dark-primary/40': day.isToday && !selected,
    };
  }

  isCurrentMonthNow(): boolean {
    const now = new Date();
    return this.currentYear() === now.getFullYear() && this.currentMonth() === now.getMonth();
  }

  shiftMonth(delta: number) {
    let m = this.currentMonth() + delta, y = this.currentYear();
    if (m > 11) { m = 0;  y++; }
    if (m < 0)  { m = 11; y--; }
    this.currentMonth.set(m); this.currentYear.set(y);
    this.loadMonth();
  }

  // ── Booking ───────────────────────────────────────────────────────────────

  confirmBooking() {
    const t    = this.selectedTime();
    const date = this.selectedDate();
    const type = this.selectedType();
    if (!t || !date || !type) return;

    this.saving.set(true);
    this.bookingError.set(null);

    this.reservationService.create({
      date,
      startTime: t.startTime,
      sessionTypeId: type.id,
      notes: this.notes.trim() || null
    }).subscribe({
      next: () => {
        this.bookedSummary.set({ date, startTime: t.startTime, endTime: t.endTime });
        this.saving.set(false);
        this.selectedTime.set(null);
        this.notes = '';
        this.showSuccess.set(true);
      },
      error: err => {
        this.saving.set(false);
        this.bookingError.set(err.error?.message ?? 'This time is no longer available. Please choose another.');
        this.selectedTime.set(null);
        this.loadMonth();
        this.loadDay();
      }
    });
  }

  resetAll() {
    this.showSuccess.set(false);
    this.bookedSummary.set(null);
    this.notes = '';
    this.selectedTime.set(null);
    this.loadMonth();
    if (this.selectedDate()) this.loadDay();
  }

  // ── Loaders ───────────────────────────────────────────────────────────────

  private loadMonth() {
    const type = this.selectedType(); if (!type) return;
    this.loadingMonth.set(true);
    const firstDay = this.toDateStr(new Date(this.currentYear(), this.currentMonth(), 1));
    const lastDay  = this.toDateStr(new Date(this.currentYear(), this.currentMonth() + 1, 0));
    this.bookingService.getFreeCounts(firstDay, lastDay, type.id).subscribe({
      next:  counts => { this.freeCounts.set(counts); this.loadingMonth.set(false); },
      error: ()     => { this.freeCounts.set({});     this.loadingMonth.set(false); }
    });
  }

  private loadDay() {
    const type = this.selectedType();
    const date = this.selectedDate();
    if (!type || !date) return;
    this.loadingDay.set(true);
    this.bookingService.getFreeTimes(date, type.id).subscribe({
      next:  times => { this.dailyTimes.set(times); this.loadingDay.set(false); },
      error: ()    => { this.dailyTimes.set([]);    this.loadingDay.set(false); }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
}
