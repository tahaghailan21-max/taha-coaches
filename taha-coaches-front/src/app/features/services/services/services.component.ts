import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SessionTypeService } from '../../../core/services/session-type/session-type.service';
import { SessionType } from '../../../core/models/session-type.model';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-background dark:bg-dark-background px-4 py-14">
      <div class="max-w-4xl mx-auto space-y-10">

        <div class="text-center">
          <h1 class="text-4xl font-bold text-primary dark:text-dark-primary mb-3">
            {{ 'services.title' | translate }}
          </h1>
          <p class="text-secondary/60 dark:text-dark-secondary/60 max-w-xl mx-auto">
            {{ 'services.subtitle' | translate }}
          </p>
        </div>

        <!-- Session type cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          @if (sessionTypes().length === 0) {
            @for (n of [1,2,3]; track n) {
              <div class="h-56 rounded-3xl bg-surface dark:bg-dark-surface animate-pulse"></div>
            }
          }
          @for (st of sessionTypes(); track st.id; let i = $index) {
            <div class="bg-surface dark:bg-dark-surface rounded-3xl shadow-sm p-7 flex flex-col gap-4
                        hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div class="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-dark-primary/10
                          flex items-center justify-center">
                <i class="bi text-xl text-primary dark:text-dark-primary"
                   [class]="ICONS[i % ICONS.length]"></i>
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-lg text-secondary dark:text-dark-secondary">
                  {{ ('sessionType.' + st.code + '.name') | translate }}
                </h3>
                <p class="text-sm text-secondary/50 dark:text-dark-secondary/50 mt-1.5 leading-relaxed">
                  {{ ('sessionType.' + st.code + '.description') | translate }}
                </p>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold px-2.5 py-1 rounded-full
                             bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary">
                  {{ st.durationMinutes }} min
                </span>
                <a routerLink="/book"
                   class="text-sm font-semibold text-primary dark:text-dark-primary
                          hover:underline flex items-center gap-1">
                  {{ 'services.bookNow' | translate }}
                  <i class="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
          }
        </div>

        <!-- Big CTA -->
        <div class="text-center pt-2">
          <a routerLink="/book"
             class="inline-flex items-center gap-2.5 px-8 py-4 rounded-full
                    bg-primary dark:bg-dark-primary text-white dark:text-dark-background
                    font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200">
            <i class="bi bi-calendar-plus"></i>
            {{ 'navbar.book' | translate }}
          </a>
        </div>

      </div>
    </div>
  `
})
export class ServicesComponent implements OnInit {

  readonly ICONS = ['bi-telephone', 'bi-lightning-charge', 'bi-trophy'];

  sessionTypes = signal<SessionType[]>([]);

  constructor(private sessionTypeService: SessionTypeService) {}

  ngOnInit() {
    this.sessionTypeService.types$.subscribe(types => this.sessionTypes.set(types));
    if (this.sessionTypeService.snapshot.length === 0) this.sessionTypeService.load();
  }
}
