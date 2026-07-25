import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { FormsModule }     from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription }    from 'rxjs';

import { AvailabilityService } from '../../../core/services/availability/availability.service';
import { Availability }        from '../../../core/models/availability.model';

type ViewMode = 'monthly' | 'weekly' | 'daily';

interface CalendarDay {
  date:           string;
  dayNumber:      number;
  monthLabel:     string;
  isCurrentMonth: boolean;
  isToday:        boolean;
  isWeekend:      boolean;
  windows:        Availability[];
}

interface Preset {
  key:     string;
  icon:    string;
  windows: [string, string][];   // [start, end] pairs, HH:mm
}

@Component({
  selector:   'app-admin-availability',
  standalone: true,
  imports:    [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="px-4 py-8">
      <div class="max-w-6xl mx-auto space-y-5">

        <!-- ── HEADER ─────────────────────────────────────────────────── -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p class="text-sm text-secondary/60 dark:text-dark-secondary/60">
            {{ 'admin.availability.subtitle' | translate }}
          </p>
          <div class="flex items-center gap-1 p-1 bg-surface dark:bg-dark-surface rounded-xl shadow-sm self-start">
            @for (mode of VIEW_MODES; track mode) {
              <button (click)="setView(mode)"
                      class="px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize"
                      [class]="viewMode() === mode
                        ? 'bg-primary dark:bg-dark-primary text-white dark:text-dark-background shadow-sm'
                        : 'text-secondary/50 dark:text-dark-secondary/50 hover:text-secondary dark:hover:text-dark-secondary'">
                {{ 'booking.view.' + mode | translate }}
              </button>
            }
          </div>
        </div>

        <!-- ── NAVIGATOR ──────────────────────────────────────────────── -->
        <div class="flex items-center justify-between bg-surface dark:bg-dark-surface rounded-2xl shadow-sm px-3 py-2.5">
          @if (viewMode() === 'monthly') {
            <button (click)="shiftMonth(-1)" class="nav-btn"><i class="bi bi-chevron-left"></i></button>
            <span class="font-bold text-secondary dark:text-dark-secondary">{{ monthLabel() }}</span>
            <button (click)="shiftMonth(1)"  class="nav-btn"><i class="bi bi-chevron-right"></i></button>
          } @else if (viewMode() === 'weekly') {
            <button (click)="shiftWeek(-1)"  class="nav-btn"><i class="bi bi-chevron-left"></i></button>
            <span class="font-bold text-secondary dark:text-dark-secondary text-sm">{{ weekRangeLabel() }}</span>
            <button (click)="shiftWeek(1)"   class="nav-btn"><i class="bi bi-chevron-right"></i></button>
          } @else {
            <button (click)="shiftDay(-1)"   class="nav-btn"><i class="bi bi-chevron-left"></i></button>
            <div class="flex items-center gap-3">
              <span class="font-bold text-secondary dark:text-dark-secondary text-sm text-center">{{ dayLabel() }}</span>
              <label class="relative flex items-center justify-center w-9 h-9 rounded-full
                            bg-primary/8 dark:bg-dark-primary/8 text-primary dark:text-dark-primary
                            hover:bg-primary/15 cursor-pointer transition-colors">
                <i class="bi bi-calendar3 text-sm pointer-events-none"></i>
                <input type="date" [value]="selectedDate()"
                       (change)="onDailyDateChange($any($event.target).value)"
                       class="absolute inset-0 opacity-0 cursor-pointer">
              </label>
            </div>
            <button (click)="shiftDay(1)"    class="nav-btn"><i class="bi bi-chevron-right"></i></button>
          }
        </div>

        <!-- ── MONTHLY VIEW ───────────────────────────────────────────── -->
        @if (viewMode() === 'monthly') {
          <div class="bg-surface dark:bg-dark-surface rounded-2xl shadow-sm overflow-hidden">
            @if (loading()) {
              <div class="p-5 space-y-3">
                @for (n of [1,2,3,4,5]; track n) {
                  <div class="h-20 rounded-xl bg-primary/5 dark:bg-dark-primary/5 animate-pulse"></div>
                }
              </div>
            } @else {
              <div class="grid grid-cols-7 border-b border-primary/10 dark:border-dark-primary/10">
                @for (h of DAY_HEADERS; track h; let hi = $index) {
                  <div class="py-2.5 text-center text-xs font-bold uppercase tracking-wider"
                       [class]="hi >= 5
                         ? 'text-primary dark:text-dark-primary bg-primary/5 dark:bg-dark-primary/5'
                         : 'text-secondary/40 dark:text-dark-secondary/40'">{{ h }}</div>
                }
              </div>
              <div class="grid grid-cols-7">
                @for (day of monthDays(); track day.date) {
                  <div class="relative border-r border-b border-primary/5 dark:border-dark-primary/5 min-h-[92px] p-2 transition-colors group"
                       [ngClass]="{
                         'bg-primary/[0.025] dark:bg-dark-primary/[0.025]': day.isWeekend,
                         'cursor-pointer hover:bg-primary/5 dark:hover:bg-dark-primary/5': day.isCurrentMonth,
                         'opacity-25 cursor-default pointer-events-none': !day.isCurrentMonth
                       }"
                       (click)="onDayClick(day)">
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="inline-flex items-center justify-center text-sm font-bold leading-none"
                            [class]="day.isToday
                              ? 'w-6 h-6 rounded-full bg-primary dark:bg-dark-primary text-white dark:text-dark-background text-xs'
                              : 'text-secondary dark:text-dark-secondary'">
                        {{ day.dayNumber }}
                      </span>
                      @if (day.isCurrentMonth) {
                        <i class="bi bi-plus-lg text-[11px] text-primary/0 group-hover:text-primary/50
                                  dark:group-hover:text-dark-primary/50 transition-colors"></i>
                      }
                    </div>
                    @for (w of day.windows; track w.id) {
                      <div class="mb-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold leading-tight truncate"
                           [class]="w.isActive
                             ? 'bg-green-100 dark:bg-green-900/25 text-green-700 dark:text-green-400'
                             : 'bg-gray-100 dark:bg-gray-800 text-gray-400 line-through'">
                        {{ formatTime(w.startTime) }}–{{ formatTime(w.endTime) }}
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- ── WEEKLY VIEW ────────────────────────────────────────────── -->
        @if (viewMode() === 'weekly') {
          <div class="bg-surface dark:bg-dark-surface rounded-2xl shadow-sm p-5">
            @if (loading()) {
              <div class="flex gap-3">
                @for (n of [1,2,3,4,5,6,7]; track n) {
                  <div class="flex-1 h-48 rounded-xl bg-primary/5 dark:bg-dark-primary/5 animate-pulse"></div>
                }
              </div>
            } @else {
              <div class="overflow-x-auto -mx-5 px-5">
                <div class="flex gap-3 min-w-[720px]">
                  @for (day of weekDays(); track day.date; let i = $index) {
                    <div class="flex-1 min-w-0">
                      <div class="text-center mb-3 pb-3 border-b"
                           [class]="day.isToday ? 'border-primary/30 dark:border-dark-primary/30' : 'border-primary/10 dark:border-dark-primary/10'">
                        <p class="text-xs font-bold uppercase tracking-wider"
                           [class]="day.isWeekend ? 'text-primary dark:text-dark-primary' : 'text-secondary/40 dark:text-dark-secondary/40'">
                          {{ DAY_HEADERS[i] }}
                        </p>
                        <span class="mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-full text-lg font-bold"
                              [class]="day.isToday ? 'bg-primary dark:bg-dark-primary text-white dark:text-dark-background' : 'text-secondary dark:text-dark-secondary'">
                          {{ day.dayNumber }}
                        </span>
                        <p class="text-[10px] text-secondary/30 mt-0.5">{{ day.monthLabel }}</p>
                      </div>
                      <div class="space-y-2">
                        @if (day.windows.length === 0) {
                          <p class="text-xs text-center text-secondary/20 py-4">—</p>
                        } @else {
                          @for (av of day.windows; track av.id) {
                            <div class="rounded-xl p-2 border text-xs transition-colors"
                                 [class]="av.isActive ? 'border-green-400/30 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700 opacity-50'">
                              <p class="font-semibold text-secondary dark:text-dark-secondary text-center">
                                {{ formatTime(av.startTime) }} – {{ formatTime(av.endTime) }}
                              </p>
                              <div class="flex gap-1 mt-1.5">
                                <button (click)="toggleWindow(av)"
                                        class="flex-1 py-1 rounded-md font-semibold transition-colors"
                                        [class]="av.isActive
                                          ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200'
                                          : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200'">
                                  <i [class]="av.isActive ? 'bi bi-pause-fill' : 'bi bi-play-fill'"></i>
                                </button>
                                <button (click)="requestDelete(av.id)"
                                        class="flex-1 py-1 rounded-md font-semibold bg-red-50 dark:bg-red-900/10 text-red-400 hover:bg-red-100 transition-colors">
                                  <i class="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          }
                        }
                      </div>
                      <button (click)="openOverlay(day.date)"
                              class="w-full mt-2 py-1.5 rounded-xl border border-dashed
                                     border-primary/20 dark:border-dark-primary/20
                                     text-primary/40 dark:text-dark-primary/40
                                     hover:border-primary/50 hover:text-primary/70 text-xs transition-colors">
                        <i class="bi bi-plus-lg"></i>
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- ── DAILY VIEW ─────────────────────────────────────────────── -->
        @if (viewMode() === 'daily') {
          <div class="grid grid-cols-1 lg:grid-cols-[1fr,1.2fr] gap-5">

            <!-- Add panel -->
            <div class="bg-surface dark:bg-dark-surface rounded-2xl shadow-sm p-5">
              <ng-container [ngTemplateOutlet]="addPanel"
                            [ngTemplateOutletContext]="{ date: selectedDate() }"></ng-container>
            </div>

            <!-- Windows list -->
            <div class="bg-surface dark:bg-dark-surface rounded-2xl shadow-sm p-5 space-y-3">
              <h2 class="text-xs font-bold uppercase tracking-wider text-secondary/40 dark:text-dark-secondary/40">
                {{ 'admin.availability.windows' | translate }}
              </h2>
              @if (loading()) {
                @for (n of [1,2]; track n) {
                  <div class="h-14 rounded-xl bg-primary/5 dark:bg-dark-primary/5 animate-pulse"></div>
                }
              } @else if (dayAvailabilities().length === 0) {
                <div class="py-10 text-center">
                  <i class="bi bi-calendar-x text-3xl text-secondary/15 dark:text-dark-secondary/15"></i>
                  <p class="text-sm text-secondary/40 dark:text-dark-secondary/40 mt-2">
                    {{ 'admin.availability.empty' | translate }}
                  </p>
                </div>
              } @else {
                <div class="space-y-2">
                  @for (av of dayAvailabilities(); track av.id) {
                    <ng-container [ngTemplateOutlet]="avCard" [ngTemplateOutletContext]="{ $implicit: av }"></ng-container>
                  }
                </div>
              }
            </div>
          </div>
        }

      </div>
    </div>

    <!-- ── DAY OVERLAY (monthly / weekly click) ───────────────────────── -->
    @if (overlayDate()) {
      <div class="fixed inset-0 z-40 flex items-end sm:items-center justify-center"
           (click)="closeOverlay()">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
        <div class="relative z-50 w-full max-w-lg bg-surface dark:bg-dark-surface
                    rounded-t-3xl sm:rounded-3xl shadow-2xl mx-0 sm:mx-4 p-6
                    max-h-[92vh] flex flex-col"
             (click)="$event.stopPropagation()">
          <div class="w-10 h-1 rounded-full bg-primary/20 mx-auto mb-4 sm:hidden"></div>

          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-secondary dark:text-dark-secondary">{{ overlayDayLabel() }}</h3>
              <p class="text-xs text-secondary/40 mt-0.5">
                {{ overlayAvailabilities().length }} window{{ overlayAvailabilities().length !== 1 ? 's' : '' }}
              </p>
            </div>
            <button (click)="closeOverlay()"
                    class="p-1.5 rounded-lg text-secondary/40 hover:bg-primary/5 transition-colors">
              <i class="bi bi-x-lg text-lg"></i>
            </button>
          </div>

          <div class="overflow-y-auto flex-1 space-y-5 pr-1">
            <!-- Add panel -->
            <ng-container [ngTemplateOutlet]="addPanel"
                          [ngTemplateOutletContext]="{ date: overlayDate()! }"></ng-container>

            <!-- Existing windows -->
            @if (overlayAvailabilities().length > 0) {
              <div class="space-y-2">
                <p class="text-xs font-bold uppercase tracking-wider text-secondary/40 dark:text-dark-secondary/40">
                  {{ 'admin.availability.windows' | translate }}
                </p>
                @for (av of overlayAvailabilities(); track av.id) {
                  <ng-container [ngTemplateOutlet]="avCard" [ngTemplateOutletContext]="{ $implicit: av }"></ng-container>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }

    <!-- ── DELETE CONFIRM ─────────────────────────────────────────────── -->
    @if (confirmDeleteId()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center px-4" (click)="confirmDeleteId.set(null)">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="relative z-50 bg-surface dark:bg-dark-surface rounded-2xl shadow-2xl p-6 max-w-sm w-full"
             (click)="$event.stopPropagation()">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <i class="bi bi-trash text-red-500 dark:text-red-400"></i>
            </div>
            <div>
              <h3 class="font-bold text-secondary dark:text-dark-secondary">Delete availability window?</h3>
              <p class="text-sm text-secondary/60 mt-1 leading-relaxed">
                Windows with active (PENDING/APPROVED) reservations cannot be deleted.
              </p>
            </div>
          </div>
          <div class="flex gap-3 mt-6 justify-end">
            <button (click)="confirmDeleteId.set(null)"
                    class="px-4 py-2 rounded-xl border border-primary/20 text-secondary dark:text-dark-secondary
                           text-sm font-semibold hover:bg-primary/5 transition-colors">
              {{ 'booking.back' | translate }}
            </button>
            <button (click)="confirmDelete()"
                    class="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
              <i class="bi bi-trash mr-1"></i> Delete
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ── ADD PANEL TEMPLATE (presets + custom range) ────────────────── -->
    <ng-template #addPanel let-date="date">
      <div class="space-y-4">

        <!-- Quick presets -->
        <div>
          <p class="text-xs font-bold uppercase tracking-wider text-secondary/40 dark:text-dark-secondary/40 mb-2">
            {{ 'admin.availability.quickAdd' | translate }}
          </p>
          <div class="grid grid-cols-3 gap-2">
            @for (p of PRESETS; track p.key) {
              <button (click)="applyPreset(date, p)"
                      [disabled]="savingPreset() !== null || presetCovered(date, p)"
                      class="relative flex flex-col items-center gap-1 px-2 py-3 rounded-2xl border-2 transition-all duration-150"
                      [class]="presetCovered(date, p)
                        ? 'border-green-400/40 bg-green-50 dark:bg-green-900/10 cursor-default'
                        : 'border-primary/15 dark:border-dark-primary/15 hover:border-primary/60 hover:bg-primary/5 dark:hover:bg-dark-primary/5 hover:-translate-y-0.5'">
                @if (presetCovered(date, p)) {
                  <span class="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-green-500
                               flex items-center justify-center">
                    <i class="bi bi-check text-white text-[9px]"></i>
                  </span>
                }
                <i class="bi text-xl"
                   [class]="p.icon + ' ' + (presetCovered(date, p)
                     ? 'text-green-600 dark:text-green-400'
                     : 'text-primary dark:text-dark-primary')"></i>
                <span class="text-xs font-bold text-secondary dark:text-dark-secondary">
                  @if (savingPreset() === p.key) {
                    <i class="bi bi-hourglass-split animate-spin"></i>
                  } @else {
                    {{ ('admin.availability.preset.' + p.key) | translate }}
                  }
                </span>
                <span class="text-[10px] text-secondary/40 dark:text-dark-secondary/40 leading-tight text-center">
                  @for (w of p.windows; track w[0]; let last = $last) {
                    {{ w[0] }}–{{ w[1] }}@if (!last) { <br> }
                  }
                </span>
              </button>
            }
          </div>
        </div>

        <!-- Custom range -->
        <div>
          <p class="text-xs font-bold uppercase tracking-wider text-secondary/40 dark:text-dark-secondary/40 mb-2">
            {{ 'admin.availability.custom' | translate }}
          </p>
          <div class="flex items-center gap-2">
            <div class="flex items-center flex-1 gap-2 px-3 py-2 rounded-xl
                        bg-primary/[0.04] dark:bg-dark-primary/[0.04]
                        border border-primary/10 dark:border-dark-primary/10">
              <i class="bi bi-clock text-primary/40 dark:text-dark-primary/40 text-sm"></i>
              <select [(ngModel)]="customStart"
                      class="time-select">
                @for (t of TIME_OPTIONS; track t) {
                  <option [value]="t">{{ t }}</option>
                }
              </select>
              <i class="bi bi-arrow-right text-secondary/30 text-xs"></i>
              <select [(ngModel)]="customEnd"
                      class="time-select">
                @for (t of TIME_OPTIONS; track t) {
                  <option [value]="t" [disabled]="t <= customStart">{{ t }}</option>
                }
              </select>
            </div>
            <button (click)="addCustom(date)"
                    [disabled]="saving() || customStart >= customEnd"
                    class="px-4 py-2.5 rounded-xl bg-primary dark:bg-dark-primary
                           text-white dark:text-dark-background text-sm font-bold
                           disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0">
              @if (saving()) {
                <i class="bi bi-hourglass-split animate-spin"></i>
              } @else {
                <i class="bi bi-plus-lg"></i>
              }
            </button>
          </div>
        </div>

        @if (addError()) {
          <p class="text-xs text-red-500 flex items-center gap-1.5">
            <i class="bi bi-exclamation-circle"></i>{{ addError() }}
          </p>
        }
      </div>
    </ng-template>

    <!-- ── AVAILABILITY CARD TEMPLATE ─────────────────────────────────── -->
    <ng-template #avCard let-av>
      <div class="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border transition-all"
           [class]="av.isActive
             ? 'border-green-400/30 bg-green-50/60 dark:bg-green-900/10'
             : 'border-gray-200 dark:border-gray-700 opacity-60'">
        <div class="flex items-center gap-3 min-w-0">
          <span class="w-2.5 h-2.5 rounded-full shrink-0"
                [class]="av.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'"></span>
          <span class="font-bold text-secondary dark:text-dark-secondary text-sm tracking-wide">
            {{ formatTime(av.startTime) }} – {{ formatTime(av.endTime) }}
          </span>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button (click)="toggleWindow(av)"
                  [title]="(av.isActive ? 'admin.availability.disable' : 'admin.availability.enable') | translate"
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors"
                  [class]="av.isActive
                    ? 'bg-yellow-50 dark:bg-yellow-900/15 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100'
                    : 'bg-green-50 dark:bg-green-900/15 text-green-600 dark:text-green-400 hover:bg-green-100'">
            <i [class]="av.isActive ? 'bi bi-pause-fill' : 'bi bi-play-fill'"></i>
          </button>
          <button (click)="requestDelete(av.id)" title="Delete"
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-sm
                         bg-red-50 dark:bg-red-900/10 text-red-400 hover:bg-red-100 hover:text-red-500 transition-colors">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .nav-btn { @apply w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary/10 dark:hover:bg-dark-primary/10 text-secondary dark:text-dark-secondary transition-colors; }
    .time-select {
      @apply bg-transparent text-sm font-bold text-secondary dark:text-dark-secondary
             focus:outline-none cursor-pointer flex-1 text-center appearance-none;
    }
    .time-select option { @apply text-secondary bg-white dark:bg-gray-800 dark:text-gray-100 font-normal; }
  `]
})
export class AdminAvailabilityComponent implements OnInit, OnDestroy {

  readonly VIEW_MODES: ViewMode[] = ['monthly', 'weekly', 'daily'];
  readonly DAY_HEADERS             = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  /** Half-hour steps from 06:00 to 22:00. */
  readonly TIME_OPTIONS: string[] = Array.from({ length: 33 }, (_, i) => {
    const h = 6 + Math.floor(i / 2), m = i % 2 === 0 ? '00' : '30';
    return `${String(h).padStart(2, '0')}:${m}`;
  });

  readonly PRESETS: Preset[] = [
    { key: 'morning', icon: 'bi-sunrise',     windows: [['09:00', '13:00']] },
    { key: 'evening', icon: 'bi-sunset',      windows: [['15:00', '19:00']] },
    { key: 'fullDay', icon: 'bi-brightness-high', windows: [['09:00', '13:00'], ['15:00', '19:00']] },
  ];

  viewMode          = signal<ViewMode>('monthly');
  currentYear       = signal(new Date().getFullYear());
  currentMonth      = signal(new Date().getMonth() + 1);
  currentWeekMonday = signal(this.getMondayOfWeek(new Date()));
  selectedDate      = signal(this.toDateStr(new Date()));

  overlayDate     = signal<string | null>(null);
  confirmDeleteId = signal<string | null>(null);

  customStart = '09:00';
  customEnd   = '13:00';

  loading      = signal(false);
  saving       = signal(false);
  savingPreset = signal<string | null>(null);
  addError     = signal<string | null>(null);

  private rawList = signal<Availability[]>([]);
  private readonly todayStr = this.toDateStr(new Date());
  private avSub!: Subscription;

  monthLabel = computed(() =>
    new Date(this.currentYear(), this.currentMonth() - 1, 1)
      .toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  );
  weekRangeLabel = computed(() => {
    const mon = new Date(this.currentWeekMonday() + 'T00:00:00');
    const sun = new Date(mon); sun.setDate(sun.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return `${fmt(mon)} – ${fmt(sun)} ${sun.getFullYear()}`;
  });
  dayLabel = computed(() =>
    new Date(this.selectedDate() + 'T00:00:00')
      .toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  );
  overlayDayLabel = computed(() => {
    const d = this.overlayDate();
    return d ? new Date(d + 'T00:00:00')
      .toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  });

  monthDays = computed<CalendarDay[]>(() =>
    this.buildMonthDays(this.currentYear(), this.currentMonth())
  );
  weekDays = computed<CalendarDay[]>(() =>
    this.buildWeekDays(this.currentWeekMonday())
  );
  dayAvailabilities = computed<Availability[]>(() =>
    this.rawList().filter(av => av.date === this.selectedDate())
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  );
  overlayAvailabilities = computed<Availability[]>(() =>
    this.rawList().filter(av => av.date === (this.overlayDate() ?? ''))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  );

  constructor(private availabilityService: AvailabilityService) {}

  ngOnInit() {
    this.avSub = this.availabilityService.availabilities$.subscribe(list => {
      this.rawList.set(list); this.loading.set(false);
    });
    this.loadMonthView();
  }
  ngOnDestroy() { this.avSub?.unsubscribe(); }

  setView(mode: string) {
    this.viewMode.set(mode as ViewMode);
    this.overlayDate.set(null);
    this.addError.set(null);
    if      (mode === 'monthly') this.loadMonthView();
    else if (mode === 'weekly')  this.loadWeekView();
    else                         this.loadDayView();
  }

  shiftMonth(delta: number) {
    let m = this.currentMonth() + delta, y = this.currentYear();
    if (m > 12) { m = 1;  y++; }
    if (m < 1)  { m = 12; y--; }
    this.currentMonth.set(m); this.currentYear.set(y); this.loadMonthView();
  }
  shiftWeek(delta: number) {
    const mon = new Date(this.currentWeekMonday() + 'T00:00:00');
    mon.setDate(mon.getDate() + delta * 7);
    this.currentWeekMonday.set(this.toDateStr(mon)); this.loadWeekView();
  }
  shiftDay(delta: number) {
    const d = new Date(this.selectedDate() + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    this.selectedDate.set(this.toDateStr(d)); this.loadDayView();
  }
  onDailyDateChange(date: string) {
    if (!date) return; this.selectedDate.set(date); this.loadDayView();
  }

  onDayClick(day: CalendarDay) { if (day.isCurrentMonth) this.openOverlay(day.date); }
  openOverlay(date: string)    { this.addError.set(null); this.overlayDate.set(date); }
  closeOverlay()               { this.overlayDate.set(null); }

  requestDelete(id: string) { this.confirmDeleteId.set(id); }
  confirmDelete() {
    const id = this.confirmDeleteId();
    if (!id) return;
    this.confirmDeleteId.set(null);
    this.availabilityService.delete(id).subscribe();
  }

  toggleWindow(av: Availability) {
    this.availabilityService.toggle(av.id, !av.isActive).subscribe();
  }

  // ── Adding ────────────────────────────────────────────────────────────────

  /** True when every window of the preset already exists for that date. */
  presetCovered(date: string, p: Preset): boolean {
    const existing = this.rawList().filter(av => av.date === date);
    return p.windows.every(([start, end]) =>
      existing.some(av => av.startTime.startsWith(start) && av.endTime.startsWith(end))
    );
  }

  /** Creates the preset's windows one after the other, skipping ones that exist. */
  applyPreset(date: string, p: Preset) {
    this.addError.set(null);
    this.savingPreset.set(p.key);

    const existing = this.rawList().filter(av => av.date === date);
    const toCreate = p.windows.filter(([start, end]) =>
      !existing.some(av => av.startTime.startsWith(start) && av.endTime.startsWith(end))
    );

    const next = (i: number) => {
      if (i >= toCreate.length) { this.savingPreset.set(null); return; }
      const [startTime, endTime] = toCreate[i];
      this.availabilityService.create({ date, startTime, endTime }).subscribe({
        next:  () => next(i + 1),
        error: err => {
          this.addError.set(err.error?.message ?? 'Error saving.');
          this.savingPreset.set(null);
        }
      });
    };
    next(0);
  }

  addCustom(date: string) {
    this.addError.set(null);
    if (this.customStart >= this.customEnd) { this.addError.set('End time must be after start time.'); return; }
    this.saving.set(true);
    this.availabilityService.create({ date, startTime: this.customStart, endTime: this.customEnd })
      .subscribe({
        next:  () => this.saving.set(false),
        error: err => { this.addError.set(err.error?.message ?? 'Error saving.'); this.saving.set(false); }
      });
  }

  formatTime(t: string): string { return t?.slice(0, 5) ?? ''; }

  // ── Loaders ───────────────────────────────────────────────────────────────

  private loadMonthView() {
    this.loading.set(true);
    this.availabilityService.loadMonth(this.currentYear(), this.currentMonth());
  }
  private loadWeekView() {
    this.loading.set(true);
    const mon = new Date(this.currentWeekMonday() + 'T00:00:00');
    const sun = new Date(mon); sun.setDate(sun.getDate() + 6);
    this.availabilityService.loadWeek(this.toDateStr(mon), this.toDateStr(sun));
  }
  private loadDayView() {
    this.loading.set(true);
    this.availabilityService.loadDate(this.selectedDate());
  }

  // ── Calendar builders ─────────────────────────────────────────────────────

  private buildMonthDays(year: number, month: number): CalendarDay[] {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay  = new Date(year, month, 0);
    const cursor   = new Date(firstDay);
    const dow = cursor.getDay();
    cursor.setDate(cursor.getDate() - (dow === 0 ? 6 : dow - 1));
    const days: CalendarDay[] = [];
    while (cursor <= lastDay || days.length % 7 !== 0) {
      if (days.length >= 42) break;
      days.push(this.buildDay(new Date(cursor), month));
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }
  private buildWeekDays(monday: string): CalendarDay[] {
    const start = new Date(monday + 'T00:00:00');
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start); d.setDate(d.getDate() + i);
      return this.buildDay(d, d.getMonth() + 1);
    });
  }
  private buildDay(d: Date, currentMonth: number): CalendarDay {
    const dateStr = this.toDateStr(d);
    return {
      date:           dateStr,
      dayNumber:      d.getDate(),
      monthLabel:     d.toLocaleDateString('en-GB', { month: 'short' }),
      isCurrentMonth: d.getMonth() + 1 === currentMonth,
      isToday:        dateStr === this.todayStr,
      isWeekend:      d.getDay() === 0 || d.getDay() === 6,
      windows:        this.rawList().filter(av => av.date === dateStr)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    };
  }
  private getMondayOfWeek(d: Date): string {
    const c = new Date(d), dow = c.getDay();
    c.setDate(c.getDate() - (dow === 0 ? 6 : dow - 1));
    return this.toDateStr(c);
  }
  private toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
}
