import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ReservationService } from '../../../core/services/reservation/reservation.service';
import { Reservation, ReservationStatus } from '../../../core/models/reservation.model';

type AdminTab = 'PENDING' | 'ALL';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8 space-y-5">

      <!-- Tabs + search row -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <div class="flex gap-1 p-1 bg-surface dark:bg-dark-surface rounded-xl shadow-sm self-start">
          @for (tab of TABS; track tab) {
            <button (click)="switchTab(tab)"
                    class="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    [class]="activeTab() === tab
                      ? 'bg-primary dark:bg-dark-primary text-white dark:text-dark-background shadow-sm'
                      : 'text-secondary/50 dark:text-dark-secondary/50 hover:text-secondary'">
              {{ tab === 'PENDING' ? 'Pending approval' : 'All reservations' }}
              @if (tab === 'PENDING' && pendingCount() > 0) {
                <span class="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                             bg-orange-500 text-white">
                  {{ pendingCount() }}
                </span>
              }
            </button>
          }
        </div>

        @if (activeTab() === 'ALL') {
          <div class="relative flex-1">
            <i class="bi bi-search absolute left-3.5 top-1/2 -translate-y-1/2
                      text-secondary/30 dark:text-dark-secondary/30"></i>
            <input type="text" [(ngModel)]="searchQuery" placeholder="Search by client, date or time…"
                   class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-primary/20 dark:border-dark-primary/20
                          bg-surface dark:bg-dark-surface text-secondary dark:text-dark-secondary text-sm
                          focus:outline-none focus:ring-2 focus:ring-primary/20">
          </div>
        }
      </div>

      <!-- List -->
      <div class="bg-surface dark:bg-dark-surface rounded-2xl shadow-sm overflow-hidden">

        @if (loading()) {
          <div class="p-6 space-y-3">
            @for (n of [1,2,3,4]; track n) {
              <div class="h-16 rounded-xl bg-primary/5 dark:bg-dark-primary/5 animate-pulse"></div>
            }
          </div>
        } @else if (displayed().length === 0) {
          <div class="py-16 text-center">
            <i class="bi bi-inbox text-4xl text-secondary/15 dark:text-dark-secondary/15"></i>
            <p class="mt-3 text-sm text-secondary/40 dark:text-dark-secondary/40">
              {{ activeTab() === 'PENDING' ? 'No pending reservations — all caught up!' : 'No reservations found.' }}
            </p>
          </div>
        } @else {
          <!-- Desktop table -->
          <table class="w-full text-left hidden md:table">
            <thead>
              <tr class="border-b border-primary/10 dark:border-dark-primary/10">
                <th class="th">Client</th>
                <th class="th">Date</th>
                <th class="th">Time</th>
                <th class="th">Type</th>
                <th class="th">Notes</th>
                <th class="th">Status</th>
                <th class="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (r of displayed(); track r.id) {
                <tr class="border-t border-primary/5 dark:border-dark-primary/5
                           hover:bg-primary/[0.015] dark:hover:bg-dark-primary/[0.015] transition-colors">
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-full bg-primary/10 dark:bg-dark-primary/10
                                  flex items-center justify-center text-primary dark:text-dark-primary
                                  text-xs font-bold shrink-0">
                        {{ initials(r.userName) }}
                      </div>
                      <span class="font-semibold text-secondary dark:text-dark-secondary text-sm">
                        {{ r.userName ?? 'Unknown' }}
                      </span>
                    </div>
                  </td>
                  <td class="px-5 py-4">
                    <p class="font-semibold text-secondary dark:text-dark-secondary text-sm">
                      {{ r.date | date:'d MMM y' }}
                    </p>
                    <p class="text-xs text-secondary/40 dark:text-dark-secondary/40">
                      {{ r.date | date:'EEEE' }}
                    </p>
                  </td>
                  <td class="px-5 py-4 font-semibold text-secondary dark:text-dark-secondary text-sm whitespace-nowrap">
                    {{ r.startTime.slice(0,5) }} – {{ r.endTime.slice(0,5) }}
                  </td>
                  <td class="px-5 py-4">
                    <span class="text-[11px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap
                                 bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary">
                      {{ r.durationMinutes }} min
                    </span>
                  </td>
                  <td class="px-5 py-4 text-xs text-secondary/50 dark:text-dark-secondary/50 max-w-[160px] truncate">
                    {{ r.notes ?? '—' }}
                  </td>
                  <td class="px-5 py-4">
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap"
                          [class]="statusClass(r.status)">
                      {{ r.status }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex flex-wrap gap-1.5">
                      <ng-container *ngTemplateOutlet="actions; context: { r }"></ng-container>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Mobile cards -->
          <div class="md:hidden divide-y divide-primary/5 dark:divide-dark-primary/5">
            @for (r of displayed(); track r.id) {
              <div class="p-4 space-y-3">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-9 h-9 rounded-full bg-primary/10 dark:bg-dark-primary/10
                                flex items-center justify-center text-primary dark:text-dark-primary
                                text-xs font-bold shrink-0">
                      {{ initials(r.userName) }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-secondary dark:text-dark-secondary text-sm truncate">
                        {{ r.userName ?? 'Unknown' }}
                      </p>
                      <p class="text-xs text-secondary/40">
                        {{ r.date | date:'EEE d MMM' }} · {{ r.startTime.slice(0,5) }}–{{ r.endTime.slice(0,5) }}
                      </p>
                    </div>
                  </div>
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0"
                        [class]="statusClass(r.status)">
                    {{ r.status }}
                  </span>
                </div>
                @if (r.notes) {
                  <p class="text-xs text-secondary/50 dark:text-dark-secondary/50">
                    <i class="bi bi-chat-left-text mr-1"></i>{{ r.notes }}
                  </p>
                }
                <div class="flex flex-wrap gap-1.5">
                  <ng-container *ngTemplateOutlet="actions; context: { r }"></ng-container>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Row actions template -->
    <ng-template #actions let-r="r">
      @if (r.status === 'PENDING') {
        <button (click)="approve(r.id)"
                class="px-2.5 py-1.5 rounded-lg text-xs font-semibold
                       bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400
                       hover:bg-green-200 transition-colors">
          <i class="bi bi-check-lg mr-1"></i>Approve
        </button>
        <button (click)="decline(r.id)"
                class="px-2.5 py-1.5 rounded-lg text-xs font-semibold
                       bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400
                       hover:bg-red-100 transition-colors">
          <i class="bi bi-x mr-1"></i>Decline
        </button>
      }
      @if (r.status === 'APPROVED') {
        <button (click)="complete(r.id)"
                class="px-2.5 py-1.5 rounded-lg text-xs font-semibold
                       bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400
                       hover:bg-blue-100 transition-colors">
          <i class="bi bi-check2-all mr-1"></i>Complete
        </button>
      }
      @if (r.status === 'PENDING' || r.status === 'APPROVED') {
        <button (click)="requestCancel(r)"
                class="px-2.5 py-1.5 rounded-lg text-xs font-semibold
                       bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400
                       hover:bg-gray-100 transition-colors">
          <i class="bi bi-slash-circle mr-1"></i>Cancel
        </button>
      }
    </ng-template>

    <!-- Cancel confirm dialog -->
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
              <h3 class="font-bold text-secondary dark:text-dark-secondary">Cancel this reservation?</h3>
              <p class="text-sm text-secondary/60 dark:text-dark-secondary/60 mt-1 leading-relaxed">
                <strong>{{ cancelTarget()!.userName ?? 'The client' }}</strong>'s session on
                <strong>{{ cancelTarget()!.date | date:'d MMM y' }}</strong>
                at <strong>{{ cancelTarget()!.startTime.slice(0,5) }}</strong>
                will be cancelled and the time freed.
              </p>
            </div>
          </div>
          <div class="flex gap-3 mt-6 justify-end">
            <button (click)="cancelTarget.set(null)"
                    class="px-4 py-2 rounded-xl border border-primary/20 dark:border-dark-primary/20
                           text-secondary dark:text-dark-secondary text-sm font-semibold
                           hover:bg-primary/5 transition-colors">
              Back
            </button>
            <button (click)="confirmCancel()"
                    class="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600
                           text-white text-sm font-semibold transition-colors">
              <i class="bi bi-x-circle mr-1"></i> Cancel reservation
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .th {
      padding: 0.875rem 1.25rem;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.4;
    }
  `]
})
export class AdminReservationsComponent implements OnInit, OnDestroy {

  readonly TABS: AdminTab[] = ['PENDING', 'ALL'];

  activeTab    = signal<AdminTab>('PENDING');
  loading      = signal(true);
  searchQuery  = '';
  cancelTarget = signal<Reservation | null>(null);

  private rawList = signal<Reservation[]>([]);
  private sub!: Subscription;

  pendingCount = computed(() => this.rawList().filter(r => r.status === 'PENDING').length);

  displayed = computed<Reservation[]>(() => {
    const list = this.rawList();
    if (this.activeTab() === 'PENDING') {
      return list.filter(r => r.status === 'PENDING');
    }
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter(r =>
      r.date.includes(q) ||
      r.startTime.includes(q) ||
      r.endTime.includes(q) ||
      (r.userName ?? '').toLowerCase().includes(q)
    );
  });

  constructor(private reservationService: ReservationService) {}

  ngOnInit() {
    this.sub = this.reservationService.reservations$.subscribe(list => {
      this.rawList.set(list);
      this.loading.set(false);
    });
    this.reservationService.loadPending();
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  switchTab(tab: AdminTab) {
    this.activeTab.set(tab);
    this.searchQuery = '';
    this.loading.set(true);
    if (tab === 'PENDING') {
      this.reservationService.loadPending();
    } else {
      this.reservationService.loadAll();
    }
  }

  approve(id: string)   { this.reservationService.approve(id).subscribe(); }
  decline(id: string)   { this.reservationService.decline(id).subscribe(); }
  complete(id: string)  { this.reservationService.complete(id).subscribe(); }

  requestCancel(r: Reservation) { this.cancelTarget.set(r); }

  confirmCancel() {
    const r = this.cancelTarget();
    if (!r) return;
    this.cancelTarget.set(null);
    this.reservationService.cancelAdmin(r.id).subscribe();
  }

  initials(name: string | null): string {
    if (!name) return '?';
    return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
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
