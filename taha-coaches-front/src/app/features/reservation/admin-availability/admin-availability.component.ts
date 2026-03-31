import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AvailabilityService } from '../../../core/services/availability/availability.service';
import { Availability } from '../../../core/models/availability.model';

@Component({
  selector: 'app-admin-availability',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-background dark:bg-dark-background px-4 py-10">
      <div class="max-w-3xl mx-auto space-y-8">

        <!-- Header -->
        <div>
          <h1 class="text-3xl font-bold text-primary dark:text-dark-primary">
            {{ 'admin.availability.title' | translate }}
          </h1>
          <p class="text-sm text-secondary/60 dark:text-dark-secondary/60 mt-1">
            {{ 'admin.availability.subtitle' | translate }}
          </p>
        </div>

        <!-- Date selector -->
        <div class="bg-surface dark:bg-dark-surface rounded-2xl shadow-sm p-5">
          <label class="block text-sm font-semibold text-secondary dark:text-dark-secondary mb-2">
            {{ 'booking.step.date' | translate }}
          </label>
          <input type="date"
                 [(ngModel)]="selectedDate"
                 (ngModelChange)="onDateChange($event)"
                 class="w-full sm:w-60 rounded-xl border border-primary/20 dark:border-dark-primary/20
                        bg-background dark:bg-dark-background
                        text-secondary dark:text-dark-secondary
                        px-4 py-2.5 text-sm
                        focus:outline-none focus:ring-2 focus:ring-primary/30">
        </div>

        <!-- Existing windows -->
        @if (selectedDate) {
          <div class="bg-surface dark:bg-dark-surface rounded-2xl shadow-sm p-5">
            <h2 class="text-base font-semibold text-secondary dark:text-dark-secondary mb-4">
              {{ 'admin.availability.windows' | translate }}
            </h2>

            @if (loading()) {
              <div class="space-y-2">
                @for (n of [1,2,3]; track n) {
                  <div class="h-14 rounded-xl bg-primary/5 dark:bg-dark-primary/5 animate-pulse"></div>
                }
              </div>
            } @else if (availabilities().length === 0) {
              <p class="text-sm text-secondary/50 dark:text-dark-secondary/50 py-4 text-center">
                {{ 'admin.availability.empty' | translate }}
              </p>
            } @else {
              <ul class="space-y-2">
                @for (av of availabilities(); track av.id) {
                  <li class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl
                             border transition-colors"
                      [class]="av.isActive
                        ? 'border-green-400/30 bg-green-50 dark:bg-green-900/10'
                        : 'border-primary/10 dark:border-dark-primary/10 bg-primary/3 dark:bg-dark-primary/3 opacity-60'">

                    <!-- Times + status badge -->
                    <div class="flex items-center gap-3">
                      <i class="bi bi-clock text-secondary/50 dark:text-dark-secondary/50"></i>
                      <span class="font-semibold text-secondary dark:text-dark-secondary text-sm">
                        {{ formatTime(av.startTime) }} – {{ formatTime(av.endTime) }}
                      </span>
                      <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                            [class]="av.isActive
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400'">
                        {{ (av.isActive ? 'admin.availability.active' : 'admin.availability.inactive') | translate }}
                      </span>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-2 ml-auto">
                      <!-- Toggle -->
                      <button (click)="toggleWindow(av)"
                              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                              [class]="av.isActive
                                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/40'
                                : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40'">
                        <i [class]="av.isActive ? 'bi bi-pause-fill' : 'bi bi-play-fill'"></i>
                        {{ (av.isActive ? 'admin.availability.disable' : 'admin.availability.enable') | translate }}
                      </button>
                      <!-- Delete -->
                      <button (click)="deleteWindow(av.id)"
                              class="px-3 py-1.5 rounded-lg text-xs font-semibold
                                     bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400
                                     hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </li>
                }
              </ul>
            }
          </div>

          <!-- Add new window -->
          <div class="bg-surface dark:bg-dark-surface rounded-2xl shadow-sm p-5">
            <h2 class="text-base font-semibold text-secondary dark:text-dark-secondary mb-4">
              {{ 'admin.availability.add' | translate }}
            </h2>

            <div class="flex flex-wrap gap-3 items-end">
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-secondary/60 dark:text-dark-secondary/60">
                  {{ 'admin.availability.startTime' | translate }}
                </label>
                <input type="time"
                       [(ngModel)]="newStart"
                       class="rounded-xl border border-primary/20 dark:border-dark-primary/20
                              bg-background dark:bg-dark-background
                              text-secondary dark:text-dark-secondary
                              px-4 py-2.5 text-sm
                              focus:outline-none focus:ring-2 focus:ring-primary/30">
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-secondary/60 dark:text-dark-secondary/60">
                  {{ 'admin.availability.endTime' | translate }}
                </label>
                <input type="time"
                       [(ngModel)]="newEnd"
                       class="rounded-xl border border-primary/20 dark:border-dark-primary/20
                              bg-background dark:bg-dark-background
                              text-secondary dark:text-dark-secondary
                              px-4 py-2.5 text-sm
                              focus:outline-none focus:ring-2 focus:ring-primary/30">
              </div>

              <button (click)="addWindow()"
                      [disabled]="!newStart || !newEnd || saving()"
                      class="px-5 py-2.5 rounded-xl
                             bg-primary dark:bg-dark-primary
                             text-white dark:text-dark-background
                             text-sm font-semibold
                             disabled:opacity-40 hover:opacity-90 transition-opacity">
                <i class="bi bi-plus-lg mr-1"></i>
                {{ saving() ? '…' : ('admin.availability.add' | translate) }}
              </button>
            </div>

            @if (addError()) {
              <p class="mt-3 text-sm text-red-500">{{ addError() }}</p>
            }
          </div>
        }

      </div>
    </div>
  `
})
export class AdminAvailabilityComponent implements OnInit {

  selectedDate = '';
  newStart = '';
  newEnd = '';

  loading = signal(false);
  saving = signal(false);
  addError = signal<string | null>(null);
  availabilities = signal<Availability[]>([]);

  constructor(private availabilityService: AvailabilityService) { }

  ngOnInit() { }

  onDateChange(date: string) {
    this.loadWindows(date);
  }

  loadWindows(date: string) {
    this.loading.set(true);
    this.availabilityService.getForDate(date).subscribe({
      next: list => { this.availabilities.set(list); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  toggleWindow(av: Availability) {
    this.availabilityService.toggle(av.id, !av.isActive).subscribe({
      next: updated => {
        this.availabilities.update(list =>
          list.map(a => a.id === updated.id ? updated : a)
        );
      }
    });
  }

  deleteWindow(id: string) {
    if (!confirm('Delete this window?')) return;
    this.availabilityService.delete(id).subscribe({
      next: () => {
        this.availabilities.update(list => list.filter(a => a.id !== id));
      }
    });
  }

  addWindow() {
    this.addError.set(null);
    if (this.newStart >= this.newEnd) {
      this.addError.set('End time must be after start time.');
      return;
    }
    this.saving.set(true);
    this.availabilityService.create({
      date: this.selectedDate,
      startTime: this.newStart,
      endTime: this.newEnd,
    }).subscribe({
      next: av => {
        this.availabilities.update(list => [...list, av]);
        this.newStart = '';
        this.newEnd = '';
        this.saving.set(false);
      },
      error: err => {
        this.addError.set(err.error?.message ?? 'Error saving.');
        this.saving.set(false);
      }
    });
  }

  formatTime(t: string): string {
    return t?.slice(0, 5) ?? '';
  }
}