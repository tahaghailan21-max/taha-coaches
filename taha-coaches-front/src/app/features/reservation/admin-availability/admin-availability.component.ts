import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AvailabilityService } from '../../../core/services/availability/availability.service';
import { Availability } from '../../../core/models/availability.model';

type ViewMode = 'monthly' | 'weekly' | 'daily';

interface CalendarDay {
  date: string;
  dayNumber: number;
  monthLabel: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  slots: Availability[];
}

interface WeekRow {
  weekNumber: number;
  days: CalendarDay[]; // Always Mon → Sun (7 days)
}

@Component({
  selector: 'app-admin-availability',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-background dark:bg-dark-background px-4 py-10">
      <div class="max-w-5xl mx-auto space-y-6">

        <!-- ── HEADER ──────────────────────────────────────────────────── -->
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-primary dark:text-dark-primary">
              {{ 'admin.availability.title' | translate }}
            </h1>
            <p class="text-sm text-secondary/60 dark:text-dark-secondary/60 mt-1">
              {{ 'admin.availability.subtitle' | translate }}
            </p>
          </div>

          <!-- View mode tabs -->
          <div class="flex items-center gap-1 p-1 bg-surface dark:bg-dark-surface rounded-xl shadow-sm self-start">
            @for (mode of VIEW_MODES; track mode) {
              <button (click)="setView(mode)"
                      class="px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize"
                      [class]="viewMode() === mode
                        ? 'bg-primary dark:bg-dark-primary text-white dark:text-dark-background shadow-sm'
                        : 'text-secondary/50 dark:text-dark-secondary/50 hover:text-secondary dark:hover:text-dark-secondary'">
                {{ mode }}
              </button>
            }
          </div>
        </div>

        <!-- ── NAVIGATOR ───────────────────────────────────────────────── -->
        <div class="flex items-center justify-between bg-surface dark:bg-dark-surface rounded-2xl shadow-sm px-4 py-3">

          @if (viewMode() === 'monthly') {
            <button (click)="shiftMonth(-1)" class="p-2 rounded-xl hover:bg-primary/5 dark:hover:bg-dark-primary/5 text-secondary dark:text-dark-secondary transition-colors">
              <i class="bi bi-chevron-left"></i>
            </button>
            <span class="font-semibold text-secondary dark:text-dark-secondary">{{ monthLabel() }}</span>
            <button (click)="shiftMonth(1)" class="p-2 rounded-xl hover:bg-primary/5 dark:hover:bg-dark-primary/5 text-secondary dark:text-dark-secondary transition-colors">
              <i class="bi bi-chevron-right"></i>
            </button>

          } @else if (viewMode() === 'weekly') {
            <button (click)="shiftWeek(-1)" class="p-2 rounded-xl hover:bg-primary/5 dark:hover:bg-dark-primary/5 text-secondary dark:text-dark-secondary transition-colors">
              <i class="bi bi-chevron-left"></i>
            </button>
            <span class="font-semibold text-secondary dark:text-dark-secondary text-sm sm:text-base">{{ weekRangeLabel() }}</span>
            <button (click)="shiftWeek(1)" class="p-2 rounded-xl hover:bg-primary/5 dark:hover:bg-dark-primary/5 text-secondary dark:text-dark-secondary transition-colors">
              <i class="bi bi-chevron-right"></i>
            </button>

          } @else {
            <button (click)="shiftDay(-1)" class="p-2 rounded-xl hover:bg-primary/5 dark:hover:bg-dark-primary/5 text-secondary dark:text-dark-secondary transition-colors">
              <i class="bi bi-chevron-left"></i>
            </button>
            <div class="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <span class="font-semibold text-secondary dark:text-dark-secondary text-sm sm:text-base text-center">
                {{ dayLabel() }}
              </span>
              <input type="date" [value]="selectedDate()"
                     (change)="onDailyDateChange($any($event.target).value)"
                     class="text-xs border border-primary/20 dark:border-dark-primary/20 rounded-lg px-2 py-1
                            bg-background dark:bg-dark-background text-secondary dark:text-dark-secondary
                            focus:outline-none focus:ring-2 focus:ring-primary/20">
            </div>
            <button (click)="shiftDay(1)" class="p-2 rounded-xl hover:bg-primary/5 dark:hover:bg-dark-primary/5 text-secondary dark:text-dark-secondary transition-colors">
              <i class="bi bi-chevron-right"></i>
            </button>
          }
        </div>

        <!-- ── MONTHLY VIEW ─────────────────────────────────────────────── -->
        @if (viewMode() === 'monthly') {
          <div class="bg-surface dark:bg-dark-surface rounded-2xl shadow-sm overflow-hidden">

            @if (loading()) {
              <div class="p-5 space-y-3">
                @for (n of [1,2,3,4,5]; track n) {
                  <div class="h-20 rounded-xl bg-primary/5 dark:bg-dark-primary/5 animate-pulse"></div>
                }
              </div>
            } @else {

              <!-- Day name headers -->
              <div class="grid grid-cols-7 border-b border-primary/10 dark:border-dark-primary/10">
                @for (h of DAY_HEADERS; track h; let hi = $index) {
                  <div class="py-2.5 text-center text-xs font-bold uppercase tracking-wider"
                       [class]="hi >= 5
                         ? 'text-primary dark:text-dark-primary bg-primary/5 dark:bg-dark-primary/5'
                         : 'text-secondary/40 dark:text-dark-secondary/40'">
                    {{ h }}
                  </div>
                }
              </div>

              <!-- Week rows -->
              @for (week of monthWeeks(); track week.weekNumber) {
                <div class="border-b border-primary/5 dark:border-dark-primary/5 last:border-0">

                  <!-- Week label strip -->
                  <div class="px-3 py-1 bg-primary/[0.02] dark:bg-dark-primary/[0.02]
                              border-b border-primary/5 dark:border-dark-primary/5">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-primary/30 dark:text-dark-primary/30">
                      Week {{ week.weekNumber }}
                    </span>
                  </div>

                  <!-- 7 day cells -->
                  <div class="grid grid-cols-7">
                    @for (day of week.days; track day.date) {
                      <div class="relative border-r border-primary/5 dark:border-dark-primary/5 last:border-0
                                  min-h-[90px] p-2 transition-colors"
                           [ngClass]="{
                             'bg-primary/[0.025] dark:bg-dark-primary/[0.025]': day.isWeekend,
                             'cursor-pointer hover:bg-primary/5 dark:hover:bg-dark-primary/5': day.isCurrentMonth,
                             'opacity-25 cursor-default pointer-events-none': !day.isCurrentMonth
                           }"
                           (click)="onDayClick(day)">

                        <!-- Day number with today ring -->
                        <div class="mb-1.5">
                          <span class="inline-flex items-center justify-center text-sm font-bold leading-none"
                                [class]="day.isToday
                                  ? 'w-6 h-6 rounded-full bg-primary dark:bg-dark-primary text-white dark:text-dark-background text-xs'
                                  : 'text-secondary dark:text-dark-secondary'">
                            {{ day.dayNumber }}
                          </span>
                          @if (day.dayNumber === 1) {
                            <span class="text-[10px] text-secondary/30 dark:text-dark-secondary/30 ml-1">{{ day.monthLabel }}</span>
                          }
                        </div>

                        <!-- Slot dot indicators -->
                        @if (day.slots.length > 0) {
                          <div class="flex flex-wrap gap-1 mb-0.5">
                            @for (s of day.slots; track s.id) {
                              <span class="w-2 h-2 rounded-full shrink-0"
                                    [class]="s.isActive ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'"></span>
                            }
                          </div>
                          <p class="text-[10px] text-secondary/30 dark:text-dark-secondary/30 leading-none">
                            {{ day.slots.length }} slot{{ day.slots.length > 1 ? 's' : '' }}
                          </p>
                        }
                      </div>
                    }
                  </div>

                </div>
              }
            }
          </div>
        }

        <!-- ── WEEKLY VIEW ──────────────────────────────────────────────── -->
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

                      <!-- Day column header -->
                      <div class="text-center mb-3 pb-3 border-b"
                           [class]="day.isToday
                             ? 'border-primary/30 dark:border-dark-primary/30'
                             : 'border-primary/10 dark:border-dark-primary/10'">
                        <p class="text-xs font-bold uppercase tracking-wider"
                           [class]="day.isWeekend ? 'text-primary dark:text-dark-primary' : 'text-secondary/40 dark:text-dark-secondary/40'">
                          {{ DAY_HEADERS[i] }}
                        </p>
                        <span class="mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-full text-lg font-bold"
                              [class]="day.isToday
                                ? 'bg-primary dark:bg-dark-primary text-white dark:text-dark-background'
                                : 'text-secondary dark:text-dark-secondary'">
                          {{ day.dayNumber }}
                        </span>
                        <p class="text-[10px] text-secondary/30 dark:text-dark-secondary/30 mt-0.5">{{ day.monthLabel }}</p>
                      </div>

                      <!-- Compact slot cards -->
                      <div class="space-y-2">
                        @if (day.slots.length === 0) {
                          <p class="text-xs text-center text-secondary/20 dark:text-dark-secondary/20 py-4">—</p>
                        } @else {
                          @for (av of day.slots; track av.id) {
                            <div class="rounded-xl p-2 border text-xs transition-colors"
                                 [class]="av.isActive
                                   ? 'border-green-400/30 bg-green-50 dark:bg-green-900/10'
                                   : 'border-gray-200 dark:border-gray-700 opacity-50'">
                              <p class="font-semibold text-secondary dark:text-dark-secondary leading-tight text-center">
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
                                        class="flex-1 py-1 rounded-md font-semibold
                                               bg-red-50 dark:bg-red-900/10 text-red-400
                                               hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                  <i class="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          }
                        }
                      </div>

                      <!-- Add slot for this day -->
                      <button (click)="openAddFor(day.date)"
                              class="w-full mt-2 py-1.5 rounded-xl border border-dashed
                                     border-primary/20 dark:border-dark-primary/20
                                     text-primary/40 dark:text-dark-primary/40
                                     hover:border-primary/50 hover:text-primary/70
                                     text-xs transition-colors">
                        <i class="bi bi-plus-lg"></i>
                      </button>
                    </div>
                  }

                </div>
              </div>
            }
          </div>
        }

        <!-- ── DAILY VIEW ───────────────────────────────────────────────── -->
        @if (viewMode() === 'daily') {
          <div class="bg-surface dark:bg-dark-surface rounded-2xl shadow-sm p-5">

            @if (loading()) {
              <div class="space-y-3">
                @for (n of [1,2,3]; track n) {
                  <div class="h-16 rounded-xl bg-primary/5 dark:bg-dark-primary/5 animate-pulse"></div>
                }
              </div>
            } @else if (daySlots().length === 0) {
              <div class="py-12 text-center">
                <i class="bi bi-calendar-x text-4xl text-secondary/15 dark:text-dark-secondary/15"></i>
                <p class="text-sm text-secondary/50 dark:text-dark-secondary/50 mt-3">
                  No availability windows for this day.
                </p>
                <button (click)="openAddFor(selectedDate())"
                        class="mt-4 px-5 py-2.5 rounded-xl bg-primary/10 dark:bg-dark-primary/10
                               text-primary dark:text-dark-primary text-sm font-semibold
                               hover:bg-primary/20 transition-colors">
                  <i class="bi bi-plus-lg mr-1"></i> Add a window
                </button>
              </div>
            } @else {
              <div class="space-y-3">
                @for (av of daySlots(); track av.id) {
                  <ng-container [ngTemplateOutlet]="fullSlotCard" [ngTemplateOutletContext]="{ $implicit: av }"></ng-container>
                }
              </div>
            }
          </div>
        }

        <!-- ── ADD FORM ─────────────────────────────────────────────────── -->
        <div id="add-form" class="bg-surface dark:bg-dark-surface rounded-2xl shadow-sm p-5">
          <h2 class="text-base font-semibold text-secondary dark:text-dark-secondary mb-4">
            {{ 'admin.availability.add' | translate }}
          </h2>

          <div class="flex flex-wrap gap-3 items-end">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-secondary/60 dark:text-dark-secondary/60">
                {{ 'booking.step.date' | translate }}
              </label>
              <input type="date" [(ngModel)]="newDate"
                     class="rounded-xl border border-primary/20 dark:border-dark-primary/20
                            bg-background dark:bg-dark-background text-secondary dark:text-dark-secondary
                            px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-secondary/60 dark:text-dark-secondary/60">
                {{ 'admin.availability.startTime' | translate }}
              </label>
              <input type="time" [(ngModel)]="newStart"
                     class="rounded-xl border border-primary/20 dark:border-dark-primary/20
                            bg-background dark:bg-dark-background text-secondary dark:text-dark-secondary
                            px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-secondary/60 dark:text-dark-secondary/60">
                {{ 'admin.availability.endTime' | translate }}
              </label>
              <input type="time" [(ngModel)]="newEnd"
                     class="rounded-xl border border-primary/20 dark:border-dark-primary/20
                            bg-background dark:bg-dark-background text-secondary dark:text-dark-secondary
                            px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            </div>

            <div class="flex items-end gap-2">
              <button (click)="addWindow()"
                      [disabled]="!newDate || !newStart || !newEnd || saving()"
                      class="px-5 py-2.5 rounded-xl bg-primary dark:bg-dark-primary
                             text-white dark:text-dark-background text-sm font-semibold
                             disabled:opacity-40 hover:opacity-90 transition-opacity">
                <i class="bi bi-plus-lg mr-1"></i>
                {{ saving() ? '…' : ('admin.availability.add' | translate) }}
              </button>

              <!-- "See slots for this date" shortcut -->
              @if (newDate) {
                <button (click)="jumpToDate(newDate)"
                        class="px-4 py-2.5 rounded-xl border border-primary/20 dark:border-dark-primary/20
                               text-primary dark:text-dark-primary text-sm font-semibold
                               hover:bg-primary/5 dark:hover:bg-dark-primary/5 transition-colors
                               flex items-center gap-1.5">
                  <i class="bi bi-calendar-week"></i>
                  {{ 'admin.availability.seeSlots' | translate }}
                </button>
              }
            </div>
          </div>

          @if (addError()) {
            <p class="mt-3 text-sm text-red-500">{{ addError() }}</p>
          }
        </div>

      </div><!-- /max-w container -->
    </div><!-- /min-h-screen -->

    <!-- ── DAY OVERLAY (monthly day click) ──────────────────────────────── -->
    @if (overlayDate()) {
      <div class="fixed inset-0 z-40 flex items-end sm:items-center justify-center"
           (click)="closeOverlay()">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

        <div class="relative z-50 w-full max-w-lg bg-surface dark:bg-dark-surface
                    rounded-t-3xl sm:rounded-3xl shadow-2xl mx-0 sm:mx-4 p-6
                    max-h-[85vh] flex flex-col"
             (click)="$event.stopPropagation()">

          <!-- Mobile drag handle -->
          <div class="w-10 h-1 rounded-full bg-primary/20 dark:bg-dark-primary/20 mx-auto mb-4 sm:hidden"></div>

          <!-- Overlay header -->
          <div class="flex items-start justify-between mb-5">
            <div>
              <h3 class="text-lg font-bold text-secondary dark:text-dark-secondary">
                {{ overlayDayLabel() }}
              </h3>
              <p class="text-xs text-secondary/40 dark:text-dark-secondary/40 mt-0.5">
                {{ overlaySlots().length }} window{{ overlaySlots().length !== 1 ? 's' : '' }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button (click)="openAddFor(overlayDate()!); closeOverlay()"
                      class="px-3 py-1.5 rounded-lg text-xs font-semibold
                             bg-primary/10 dark:bg-dark-primary/10
                             text-primary dark:text-dark-primary
                             hover:bg-primary/20 transition-colors flex items-center gap-1">
                <i class="bi bi-plus-lg"></i> Add window
              </button>
              <button (click)="closeOverlay()"
                      class="p-1.5 rounded-lg text-secondary/40 hover:text-secondary
                             hover:bg-primary/5 dark:hover:bg-dark-primary/5 transition-colors">
                <i class="bi bi-x-lg text-lg"></i>
              </button>
            </div>
          </div>

          <!-- Overlay slot list -->
          <div class="overflow-y-auto flex-1 space-y-3 pr-1">
            @if (overlaySlots().length === 0) {
              <div class="py-8 text-center">
                <i class="bi bi-calendar-x text-3xl text-secondary/15 dark:text-dark-secondary/15"></i>
                <p class="text-sm text-secondary/40 dark:text-dark-secondary/40 mt-2">
                  No windows for this day.
                </p>
              </div>
            } @else {
              @for (av of overlaySlots(); track av.id) {
                <ng-container [ngTemplateOutlet]="fullSlotCard" [ngTemplateOutletContext]="{ $implicit: av }"></ng-container>
              }
            }
          </div>
        </div>
      </div>
    }

    <!-- ── CUSTOM CONFIRM DIALOG ─────────────────────────────────────────── -->
    @if (confirmPending()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center px-4"
           (click)="cancelDelete()">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="relative z-50 bg-surface dark:bg-dark-surface rounded-2xl shadow-2xl p-6 max-w-sm w-full"
             (click)="$event.stopPropagation()">

          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <i class="bi bi-trash text-red-500 dark:text-red-400"></i>
            </div>
            <div>
              <h3 class="font-bold text-secondary dark:text-dark-secondary">Delete availability window?</h3>
              <p class="text-sm text-secondary/60 dark:text-dark-secondary/60 mt-1 leading-relaxed">
                This action cannot be undone. Existing bookings inside this window will
                <strong>not</strong> be automatically cancelled.
              </p>
            </div>
          </div>

          <div class="flex gap-3 mt-6 justify-end">
            <button (click)="cancelDelete()"
                    class="px-4 py-2 rounded-xl border border-primary/20 dark:border-dark-primary/20
                           text-secondary dark:text-dark-secondary text-sm font-semibold
                           hover:bg-primary/5 dark:hover:bg-dark-primary/5 transition-colors">
              Cancel
            </button>
            <button (click)="confirmDelete()"
                    class="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600
                           text-white text-sm font-semibold transition-colors">
              <i class="bi bi-trash mr-1"></i> Delete
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ── SHARED SLOT CARD TEMPLATE ─────────────────────────────────────── -->
    <ng-template #fullSlotCard let-av>
      <div class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-colors"
           [class]="av.isActive
             ? 'border-green-400/30 bg-green-50 dark:bg-green-900/10'
             : 'border-gray-200 dark:border-gray-700 opacity-60'">
        <div class="flex items-center gap-3 min-w-0">
          <i class="bi bi-clock text-secondary/40 dark:text-dark-secondary/40"></i>
          <span class="font-semibold text-secondary dark:text-dark-secondary text-sm">
            {{ formatTime(av.startTime) }} – {{ formatTime(av.endTime) }}
          </span>
          <span class="shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold"
                [class]="av.isActive
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400'">
            {{ av.isActive ? ('admin.availability.active' | translate) : ('admin.availability.inactive' | translate) }}
          </span>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button (click)="toggleWindow(av)"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  [class]="av.isActive
                    ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200'
                    : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200'">
            <i [class]="av.isActive ? 'bi bi-pause-fill' : 'bi bi-play-fill'"></i>
            {{ av.isActive ? ('admin.availability.disable' | translate) : ('admin.availability.enable' | translate) }}
          </button>
          <button (click)="requestDelete(av.id)"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold
                         bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400
                         hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </ng-template>
  `
})
export class AdminAvailabilityComponent implements OnInit, OnDestroy {

  readonly VIEW_MODES: ViewMode[] = ['monthly', 'weekly', 'daily'];
  readonly DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // ── View & navigation state ────────────────────────────────────────────
  viewMode         = signal<ViewMode>('monthly');
  currentYear      = signal(new Date().getFullYear());
  currentMonth     = signal(new Date().getMonth() + 1); // 1-based
  currentWeekMonday = signal(this.getMondayOfWeek(new Date()));
  selectedDate     = signal(this.toDateStr(new Date()));

  // ── Overlay state ──────────────────────────────────────────────────────
  overlayDate    = signal<string | null>(null);
  confirmPending = signal<string | null>(null);

  // ── Add form ───────────────────────────────────────────────────────────
  newDate  = '';
  newStart = '';
  newEnd   = '';

  // ── Status ─────────────────────────────────────────────────────────────
  loading  = signal(false);
  saving   = signal(false);
  addError = signal<string | null>(null);

  private rawList    = signal<Availability[]>([]);
  private readonly todayStr = this.toDateStr(new Date());
  private sub!: Subscription;

  // ── Computed labels ────────────────────────────────────────────────────

  monthLabel = computed(() =>
    new Date(this.currentYear(), this.currentMonth() - 1, 1)
      .toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  );

  weekRangeLabel = computed(() => {
    const mon = new Date(this.currentWeekMonday() + 'T00:00:00');
    const sun = new Date(mon);
    sun.setDate(sun.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return `${fmt(mon)} – ${fmt(sun)} ${sun.getFullYear()}`;
  });

  dayLabel = computed(() =>
    new Date(this.selectedDate() + 'T00:00:00')
      .toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  );

  overlayDayLabel = computed(() => {
    const d = this.overlayDate();
    if (!d) return '';
    return new Date(d + 'T00:00:00')
      .toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  });

  // ── Computed views ─────────────────────────────────────────────────────

  monthWeeks = computed<WeekRow[]>(() =>
    this.buildMonthWeeks(this.currentYear(), this.currentMonth())
  );

  weekDays = computed<CalendarDay[]>(() =>
    this.buildWeekDays(this.currentWeekMonday())
  );

  daySlots = computed<Availability[]>(() =>
    this.rawList()
      .filter(av => av.date === this.selectedDate())
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  );

  overlaySlots = computed<Availability[]>(() =>
    this.rawList()
      .filter(av => av.date === (this.overlayDate() ?? ''))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  );

  constructor(private availabilityService: AvailabilityService) {}

  ngOnInit() {
    this.sub = this.availabilityService.availabilities$.subscribe(list => {
      this.rawList.set(list);
      this.loading.set(false);
    });
    this.loadMonthView(); // default view is monthly
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  // ── View switching ─────────────────────────────────────────────────────

  setView(mode: string) {
    this.viewMode.set(mode as ViewMode);
    this.overlayDate.set(null);
    if      (mode === 'monthly') this.loadMonthView();
    else if (mode === 'weekly')  this.loadWeekView();
    else                         this.loadDayView();
  }

  // ── Navigation ─────────────────────────────────────────────────────────

  shiftMonth(delta: number) {
    let m = this.currentMonth() + delta;
    let y = this.currentYear();
    if (m > 12) { m = 1;  y++; }
    if (m < 1)  { m = 12; y--; }
    this.currentMonth.set(m);
    this.currentYear.set(y);
    this.loadMonthView();
  }

  shiftWeek(delta: number) {
    const mon = new Date(this.currentWeekMonday() + 'T00:00:00');
    mon.setDate(mon.getDate() + delta * 7);
    this.currentWeekMonday.set(this.toDateStr(mon));
    this.loadWeekView();
  }

  shiftDay(delta: number) {
    const d = new Date(this.selectedDate() + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    this.selectedDate.set(this.toDateStr(d));
    this.loadDayView();
  }

  onDailyDateChange(date: string) {
    if (!date) return;
    this.selectedDate.set(date);
    this.loadDayView();
  }

  jumpToDate(date: string) {
    if (!date) return;
    this.selectedDate.set(date);
    this.viewMode.set('daily');
    this.overlayDate.set(null);
    this.loadDayView();
  }
  // ── Overlay ────────────────────────────────────────────────────────────

  onDayClick(day: CalendarDay) {
    if (day.isCurrentMonth) this.openOverlay(day.date);
  }

  openOverlay(date: string) { this.overlayDate.set(date); }
  closeOverlay()            { this.overlayDate.set(null); }

  // ── Delete confirm ─────────────────────────────────────────────────────

  requestDelete(id: string) { this.confirmPending.set(id); }
  cancelDelete()            { this.confirmPending.set(null); }

  confirmDelete() {
    const id = this.confirmPending();
    if (!id) return;
    this.confirmPending.set(null);
    this.availabilityService.delete(id).subscribe();
  }

  // ── CRUD actions ───────────────────────────────────────────────────────

  toggleWindow(av: Availability) {
    this.availabilityService.toggle(av.id, !av.isActive).subscribe();
  }

  openAddFor(date: string) {
    this.newDate = date;
    setTimeout(() => document.getElementById('add-form')?.scrollIntoView({ behavior: 'smooth' }), 50);
  }


  addWindow() {
    this.addError.set(null);
    if (this.newStart >= this.newEnd) {
      this.addError.set('End time must be after start time.');
      return;
    }
    this.saving.set(true);
    this.availabilityService.create({
      date:      this.newDate,
      startTime: this.newStart,
      endTime:   this.newEnd,
    }).subscribe({
      next: () => {
        this.newDate  = '';
        this.newStart = '';
        this.newEnd   = '';
        this.saving.set(false);
      },
      error: err => {
        this.addError.set(err.error?.message ?? 'Error saving.');
        this.saving.set(false);
      }
    });
  }

  formatTime(t: string): string { return t?.slice(0, 5) ?? ''; }

  // ── Private helpers ────────────────────────────────────────────────────

  private loadMonthView(): void {
    this.loading.set(true);
    this.availabilityService.loadMonth(this.currentYear(), this.currentMonth());
  }

  private loadWeekView(): void {
    this.loading.set(true);
    const mon = new Date(this.currentWeekMonday() + 'T00:00:00');
    const sun = new Date(mon);
    sun.setDate(sun.getDate() + 6);
    this.availabilityService.loadWeek(this.toDateStr(mon), this.toDateStr(sun));
  }

  private loadDayView(): void {
    this.loading.set(true);
    this.availabilityService.loadDate(this.selectedDate());
  }

  private buildMonthWeeks(year: number, month: number): WeekRow[] {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay  = new Date(year, month, 0);

    // Rewind to the Monday of the week containing day 1
    const cursor = new Date(firstDay);
    const dow = cursor.getDay();
    cursor.setDate(cursor.getDate() - (dow === 0 ? 6 : dow - 1));

    const weeks: WeekRow[] = [];
    let weekNum = 1;

    while (cursor <= lastDay) {
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(cursor);
        d.setDate(d.getDate() + i);
        return this.buildDay(d, month);
      });
      weeks.push({ weekNumber: weekNum++, days });
      cursor.setDate(cursor.getDate() + 7);
    }

    return weeks;
  }

  private buildWeekDays(monday: string): CalendarDay[] {
    const start = new Date(monday + 'T00:00:00');
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return this.buildDay(d, d.getMonth() + 1); // isCurrentMonth always true in weekly view
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
      slots:          this.rawList()
        .filter(av => av.date === dateStr)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    };
  }

  private getMondayOfWeek(d: Date): string {
    const clone = new Date(d);
    const dow = clone.getDay();
    clone.setDate(clone.getDate() - (dow === 0 ? 6 : dow - 1));
    return this.toDateStr(clone);
  }

// AFTER — always uses the local calendar date
  private toDateStr(d: Date): string {
    const y   = d.getFullYear();
    const m   = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
