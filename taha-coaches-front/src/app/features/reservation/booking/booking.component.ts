import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ReservationService } from '../../../core/services/reservation/reservation.service';

type Step = 'calendar' | 'timeslot' | 'confirm' | 'success';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  template:
    `
    <div class="min-h-screen bg-background dark:bg-dark-background px-4 py-10">
      <div class="max-w-2xl mx-auto">

        <!-- Page title -->
        <h1 class="text-3xl font-bold text-primary dark:text-dark-primary mb-8">
          {{ 'booking.title' | translate }}
        </h1>

        <!-- Step indicator -->
        <div class="flex items-center gap-2 mb-10">
          @for (s of steps; track s.key; let i = $index) {
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors"
                   [class]="stepIndex() >= i
                     ? 'bg-primary dark:bg-dark-primary text-white'
                     : 'bg-primary/10 dark:bg-dark-primary/10 text-secondary dark:text-dark-secondary'">
                {{ i + 1 }}
              </div>
              @if (i < steps.length - 1) {
                <div class="w-10 h-0.5 transition-colors"
                     [class]="stepIndex() > i
                       ? 'bg-primary dark:bg-dark-primary'
                       : 'bg-primary/20 dark:bg-dark-primary/20'">
                </div>
              }
            </div>
          }
        </div>

        <!-- ══════════════════════════════════════════════
             STEP 1 — Calendar
        ══════════════════════════════════════════════ -->
        @if (step() === 'calendar') {
          <div class="bg-surface dark:bg-dark-surface rounded-2xl shadow-sm p-6">
            <h2 class="text-lg font-semibold text-secondary dark:text-dark-secondary mb-6">
              {{ 'booking.step.date' | translate }}
            </h2>

            <!-- Month navigation -->
            <div class="flex items-center justify-between mb-4">
              <button (click)="prevMonth()"
                      class="w-9 h-9 rounded-full bg-primary/10 dark:bg-dark-primary/10
                             hover:bg-primary/20 dark:hover:bg-dark-primary/20
                             text-secondary dark:text-dark-secondary
                             flex items-center justify-center transition-colors">
                <i class="bi bi-chevron-left text-sm"></i>
              </button>
              <span class="font-semibold text-secondary dark:text-dark-secondary">
                {{ monthLabel() }}
              </span>
              <button (click)="nextMonth()"
                      class="w-9 h-9 rounded-full bg-primary/10 dark:bg-dark-primary/10
                             hover:bg-primary/20 dark:hover:bg-dark-primary/20
                             text-secondary dark:text-dark-secondary
                             flex items-center justify-center transition-colors">
                <i class="bi bi-chevron-right text-sm"></i>
              </button>
            </div>

            <!-- Day-of-week headers -->
            <div class="grid grid-cols-7 mb-2">
              @for (d of dayNames; track d) {
                <div class="text-center text-xs font-semibold text-secondary/50 dark:text-dark-secondary/50 py-1">
                  {{ d }}
                </div>
              }
            </div>

            <!-- Calendar grid -->
            <div class="grid grid-cols-7 gap-1">
              @for (cell of calendarCells(); track cell.key) {
                <button
                  [disabled]="!cell.date || cell.isPast"
                  (click)="cell.date && !cell.isPast && selectDate(cell.date)"
                  class="aspect-square rounded-xl text-sm font-medium transition-all flex items-center justify-center"
                  [class]="cellClass(cell)">
                  {{ cell.day }}
                </button>
              }
            </div>
          </div>
        }

        <!-- ══════════════════════════════════════════════
             STEP 2 — Time slot picker
        ══════════════════════════════════════════════ -->
        @if (step() === 'timeslot') {
          <div class="bg-surface dark:bg-dark-surface rounded-2xl shadow-sm p-6">

            <!-- Date pill + back -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-2">
                <button (click)="goTo('calendar')"
                        class="text-secondary/50 dark:text-dark-secondary/50 hover:text-accent dark:hover:text-dark-accent transition-colors">
                  <i class="bi bi-arrow-left text-base"></i>
                </button>
                <span class="text-sm font-semibold px-3 py-1 rounded-full
                             bg-primary/10 dark:bg-dark-primary/10
                             text-primary dark:text-dark-primary">
                  {{ selectedDate() }}
                </span>
              </div>
              <span class="text-sm text-secondary/50 dark:text-dark-secondary/50">
                {{ 'booking.step.time' | translate }}
              </span>
            </div>

            @if (loadingSlots()) {
              <!-- Loading skeleton -->
              <div class="grid grid-cols-4 gap-2">
                @for (n of [1,2,3,4,5,6,7,8]; track n) {
                  <div class="h-10 rounded-xl bg-primary/5 dark:bg-dark-primary/5 animate-pulse"></div>
                }
              </div>
            } @else if (slots60().length === 0 && slots90().length === 0) {
              <p class="text-center text-secondary/50 dark:text-dark-secondary/50 py-8">
                {{ 'booking.noSlots' | translate }}
              </p>
            } @else {

              <!-- How this works hint -->
              @if (!selectedStart()) {
                <p class="text-xs text-secondary/50 dark:text-dark-secondary/50 mb-4">
                  {{ 'booking.hint.selectStart' | translate }}
                </p>
              }

              <!-- Time grid -->
              <div class="grid grid-cols-4 gap-2 mb-6">
                @for (slot of allDisplaySlots(); track slot.time) {
                  <button
                    [disabled]="slot.disabled"
                    (click)="!slot.disabled && selectStart(slot.time)"
                    class="h-10 rounded-xl text-sm font-semibold transition-all"
                    [class]="slotClass(slot)">
                    {{ formatTime(slot.time) }}
                  </button>
                }
              </div>

              <!-- Duration picker — shown only after a start is selected -->
              @if (selectedStart()) {
                <div class="border-t border-primary/10 dark:border-dark-primary/10 pt-5">
                  <p class="text-sm font-semibold text-secondary dark:text-dark-secondary mb-3">
                    {{ 'booking.step.duration' | translate }}
                  </p>
                  <div class="flex gap-3">
                    @for (d of availableDurations(); track d) {
                      <button (click)="selectDuration(d)"
                              class="flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all"
                              [class]="selectedDuration() === d
                                ? 'border-accent dark:border-dark-accent bg-accent/10 dark:bg-dark-accent/10 text-accent dark:text-dark-accent'
                                : 'border-primary/20 dark:border-dark-primary/20 text-secondary dark:text-dark-secondary hover:border-primary/50 dark:hover:border-dark-primary/50'">
                        {{ 'booking.duration.' + d | translate }}
                      </button>
                    }
                  </div>

                  <!-- Proceed button -->
                  @if (selectedDuration()) {
                    <button (click)="goTo('confirm')"
                            class="mt-4 w-full py-3 rounded-xl
                                   bg-primary dark:bg-dark-primary
                                   text-white dark:text-dark-background
                                   font-semibold hover:opacity-90 transition-opacity">
                      {{ 'booking.step.notes' | translate }} →
                    </button>
                  }
                </div>
              }
            }
          </div>
        }

        <!-- ══════════════════════════════════════════════
             STEP 3 — Notes + confirm
        ══════════════════════════════════════════════ -->
        @if (step() === 'confirm') {
          <div class="bg-surface dark:bg-dark-surface rounded-2xl shadow-sm p-6 space-y-5">

            <!-- Summary card -->
            <div class="rounded-xl bg-primary/5 dark:bg-dark-primary/5 p-4 space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-secondary/60 dark:text-dark-secondary/60">{{ 'reservations.date' | translate }}</span>
                <span class="font-semibold text-secondary dark:text-dark-secondary">{{ selectedDate() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary/60 dark:text-dark-secondary/60">{{ 'reservations.time' | translate }}</span>
                <span class="font-semibold text-secondary dark:text-dark-secondary">{{ formatTime(selectedStart()!) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary/60 dark:text-dark-secondary/60">{{ 'reservations.duration' | translate }}</span>
                <span class="font-semibold text-secondary dark:text-dark-secondary">
                  {{ 'booking.duration.' + selectedDuration() | translate }}
                </span>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-semibold text-secondary dark:text-dark-secondary mb-2">
                {{ 'booking.step.notes' | translate }}
              </label>
              <textarea
                [(ngModel)]="notes"
                rows="4"
                [placeholder]="'booking.notesPlaceholder' | translate"
                class="w-full rounded-xl border border-primary/20 dark:border-dark-primary/20
                       bg-background dark:bg-dark-background
                       text-secondary dark:text-dark-secondary
                       px-4 py-3 text-sm resize-none
                       focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-dark-primary/30">
              </textarea>
            </div>

            <!-- Error -->
            @if (errorMsg()) {
              <p class="text-sm text-red-500 font-medium">{{ errorMsg() }}</p>
            }

            <!-- Actions -->
            <div class="flex gap-3">
              <button (click)="goTo('timeslot')"
                      class="flex-1 py-3 rounded-xl border border-primary/20 dark:border-dark-primary/20
                             text-secondary dark:text-dark-secondary text-sm font-semibold
                             hover:bg-primary/5 dark:hover:bg-dark-primary/5 transition-colors">
                ← {{ 'booking.step.time' | translate }}
              </button>
              <button (click)="confirm()"
                      [disabled]="submitting()"
                      class="flex-1 py-3 rounded-xl
                             bg-primary dark:bg-dark-primary
                             text-white dark:text-dark-background
                             font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity">
                {{ submitting() ? '…' : ('booking.confirm' | translate) }}
              </button>
            </div>
          </div>
        }

        <!-- ══════════════════════════════════════════════
             SUCCESS
        ══════════════════════════════════════════════ -->
        @if (step() === 'success') {
          <div class="text-center py-16 space-y-4">
            <div class="text-6xl">✅</div>
            <h2 class="text-2xl font-bold text-secondary dark:text-dark-secondary">
              {{ 'booking.success' | translate }}
            </h2>
            <div class="flex justify-center gap-3 mt-6">
              <a routerLink="/reservations"
                 class="px-6 py-2.5 rounded-xl border border-primary/20 dark:border-dark-primary/20
                        text-secondary dark:text-dark-secondary text-sm font-semibold
                        hover:bg-primary/5 transition-colors">
                {{ 'navbar.myReservations' | translate }}
              </a>
              <button (click)="resetAll()"
                      class="px-6 py-2.5 rounded-xl
                             bg-primary dark:bg-dark-primary
                             text-white dark:text-dark-background
                             text-sm font-semibold hover:opacity-90 transition-opacity">
                {{ 'booking.title' | translate }}
              </button>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class BookingComponent implements OnInit {

  // ── signals ───────────────────────────────────────────────────────────────
  step = signal<Step>('calendar');
  selectedDate = signal<string>('');
  selectedStart = signal<string | null>(null);
  selectedDuration = signal<60 | 90 | null>(null);
  notes = '';

  loadingSlots = signal(false);
  slots60 = signal<string[]>([]);
  slots90 = signal<string[]>([]);
  submitting = signal(false);
  errorMsg = signal<string | null>(null);

  // calendar state
  viewYear = signal(new Date().getFullYear());
  viewMonth = signal(new Date().getMonth()); // 0-indexed

  readonly steps = [
    { key: 'calendar' },
    { key: 'timeslot' },
    { key: 'confirm' },
  ];

  readonly dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // ── derived ───────────────────────────────────────────────────────────────

  stepIndex = computed(() => {
    const map: Record<string, number> = { calendar: 0, timeslot: 1, confirm: 2, success: 2 };
    return map[this.step()] ?? 0;
  });

  monthLabel = computed(() => {
    return new Date(this.viewYear(), this.viewMonth(), 1)
      .toLocaleString('default', { month: 'long', year: 'numeric' });
  });

  calendarCells = computed(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    // Convert to Mon=0 grid
    const offset = (firstDay + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cells: { key: string; day: number | null; date: string | null; isPast: boolean }[] = [];

    for (let i = 0; i < offset; i++) {
      cells.push({ key: `empty-${i}`, day: null, date: null, isPast: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = this.toIso(date);
      cells.push({
        key: dateStr,
        day: d,
        date: dateStr,
        isPast: date < today
      });
    }
    return cells;
  });

  /** Union of slots available for either duration, to render the grid */
  allDisplaySlots = computed(() => {
    const set60 = new Set(this.slots60());
    const set90 = new Set(this.slots90());
    const all = [...new Set([...set60, ...set90])].sort();
    return all.map(t => ({
      time: t,
      available60: set60.has(t),
      available90: set90.has(t),
      disabled: !set60.has(t) && !set90.has(t),
    }));
  });

  /** Which durations are valid for the selected start time */
  availableDurations = computed((): (60 | 90)[] => {
    const start = this.selectedStart();
    if (!start) return [];
    const set60 = new Set(this.slots60());
    const set90 = new Set(this.slots90());
    const result: (60 | 90)[] = [];
    if (set60.has(start)) result.push(60);
    if (set90.has(start)) result.push(90);
    return result;
  });

  constructor(
    private reservationService: ReservationService,
    private router: Router
  ) { }

  ngOnInit() { }

  // ── calendar helpers ──────────────────────────────────────────────────────

  prevMonth() {
    if (this.viewMonth() === 0) {
      this.viewMonth.set(11);
      this.viewYear.update(y => y - 1);
    } else {
      this.viewMonth.update(m => m - 1);
    }
  }

  nextMonth() {
    if (this.viewMonth() === 11) {
      this.viewMonth.set(0);
      this.viewYear.update(y => y + 1);
    } else {
      this.viewMonth.update(m => m + 1);
    }
  }

  selectDate(dateStr: string) {
    this.selectedDate.set(dateStr);
    this.selectedStart.set(null);
    this.selectedDuration.set(null);
    this.loadSlots(dateStr);
    this.goTo('timeslot');
  }

  // ── slot helpers ──────────────────────────────────────────────────────────

  loadSlots(date: string) {
    this.loadingSlots.set(true);
    this.slots60.set([]);
    this.slots90.set([]);

    // Fetch both durations in parallel
    let done = 0;
    const finish = () => { if (++done === 2) this.loadingSlots.set(false); };

    this.reservationService.getAvailableSlots(date, 60).subscribe({
      next: s => { this.slots60.set(s); finish(); },
      error: () => finish()
    });
    this.reservationService.getAvailableSlots(date, 90).subscribe({
      next: s => { this.slots90.set(s); finish(); },
      error: () => finish()
    });
  }

  selectStart(time: string) {
    this.selectedStart.set(time);
    this.selectedDuration.set(null); // reset duration when start changes
  }

  selectDuration(d: 60 | 90) {
    this.selectedDuration.set(d);
  }

  // ── confirm ───────────────────────────────────────────────────────────────

  confirm() {
    this.errorMsg.set(null);
    this.submitting.set(true);

    this.reservationService.createReservation({
      date: this.selectedDate(),
      time: this.selectedStart()!,
      durationMinutes: this.selectedDuration()!,
      notes: this.notes,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.step.set('success');
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err.error?.message ?? err.error?.messageKey ?? 'error.generic';
        this.errorMsg.set(msg);
      }
    });
  }

  resetAll() {
    this.step.set('calendar');
    this.selectedDate.set('');
    this.selectedStart.set(null);
    this.selectedDuration.set(null);
    this.notes = '';
    this.errorMsg.set(null);
  }

  goTo(s: Step) {
    this.step.set(s);
  }

  // ── style helpers ─────────────────────────────────────────────────────────

  cellClass(cell: { date: string | null; isPast: boolean; day: number | null }): string {
    if (!cell.date) return 'invisible';
    if (cell.isPast) return 'text-secondary/20 dark:text-dark-secondary/20 cursor-not-allowed';
    if (cell.date === this.selectedDate()) {
      return 'bg-primary dark:bg-dark-primary text-white font-bold scale-105 shadow-sm';
    }
    return 'text-secondary dark:text-dark-secondary hover:bg-primary/10 dark:hover:bg-dark-primary/10 hover:text-accent dark:hover:text-dark-accent cursor-pointer';
  }

  slotClass(slot: { time: string; disabled: boolean }): string {
    if (slot.disabled) {
      return 'bg-primary/5 dark:bg-dark-primary/5 text-secondary/25 dark:text-dark-secondary/25 cursor-not-allowed line-through';
    }
    if (slot.time === this.selectedStart()) {
      return 'bg-accent dark:bg-dark-accent text-white scale-105 shadow-sm';
    }
    return 'bg-primary/10 dark:bg-dark-primary/10 text-secondary dark:text-dark-secondary hover:bg-primary/20 dark:hover:bg-dark-primary/20 hover:text-accent dark:hover:text-dark-accent cursor-pointer';
  }

  formatTime(t: string): string {
    return t?.slice(0, 5) ?? '';
  }

  toIso(d: Date): string {
    return d.toISOString().slice(0, 10);
  }
}
