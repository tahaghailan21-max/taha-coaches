import { Component, OnInit } from '@angular/core';
import { RouterModule } from "@angular/router";
import { DarkModeToggleComponent } from "../dark-mode-toggle/dark-mode-toggle.component";
import { LanguageToggleComponent } from "../language-toggle/language-toggle.component";
import { CommonModule } from "@angular/common";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MiniLoginComponent } from "../../../features/auth/mini-login/mini-login.component";
import { AuthService } from '../../../core/services/auth/auth.service';
import { User } from '../../../core/models/user.model';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterModule,
    DarkModeToggleComponent,
    LanguageToggleComponent,
    CommonModule,
    TranslateModule,
    MiniLoginComponent
  ],
  template: `
    <nav class="bg-surface dark:bg-dark-surface shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">

          <!-- Logo -->
          <div class="flex-shrink-0">
            <a routerLink="/"
               class="text-primary dark:text-dark-primary font-bold text-xl
                       hover:text-accent dark:hover:text-dark-accent transition-colors duration-200"
            >
              TC
            </a>
          </div>

          <!-- Navigation Links (Center) -->
          <div class="hidden md:flex space-x-4 mx-auto h-full">
            <a routerLink="/" class="flex items-center justify-center px-5 h-full rounded-3xl text-secondary dark:text-dark-secondary hover:text-accent dark:hover:text-dark-accent hover:bg-primary/20 dark:hover:bg-dark-primary/20 transition transform hover:scale-105 hover:shadow-sm">
              {{ 'navbar.home' | translate }}
            </a>
            <a routerLink="/services" class="flex items-center justify-center px-5 h-full rounded-3xl text-secondary dark:text-dark-secondary hover:text-accent dark:hover:text-dark-accent hover:bg-primary/20 dark:hover:bg-dark-primary/20 transition transform hover:scale-105 hover:shadow-sm">
              {{ 'navbar.services' | translate }}
            </a>
            <a routerLink="/book" class="flex items-center justify-center px-5 h-full rounded-3xl text-secondary dark:text-dark-secondary hover:text-accent dark:hover:text-dark-accent hover:bg-primary/20 dark:hover:bg-dark-primary/20 transition transform hover:scale-105 hover:shadow-sm">
              {{ 'navbar.book' | translate }}
            </a>
            <a routerLink="/contact" class="flex items-center justify-center px-5 h-full rounded-3xl text-secondary dark:text-dark-secondary hover:text-accent dark:hover:text-dark-accent hover:bg-primary/20 dark:hover:bg-dark-primary/20 transition transform hover:scale-105 hover:shadow-sm">
              {{ 'navbar.contact' | translate }}
            </a>
          </div>

          <!-- Right-side controls -->
          <div class="flex items-center space-x-3">

            <!-- Login / User Menu -->
            <div class="relative group">

              <!-- NOT logged in: Login button -->
              <ng-container *ngIf="!(currentUser$ | async); else userMenu">
                <button
                  class="flex items-center gap-2 px-4 h-8 rounded-full bg-primary dark:bg-dark-primary text-white dark:text-dark-background
                         hover:bg-primary/85 dark:hover:bg-dark-primary/75 hover:shadow-md transition-all duration-200"
                >
                  <i class="bi bi-person-fill"></i>
                  {{ 'navbar.login' | translate }}
                </button>

                <!-- Mini Login Dropdown -->
                <div
                  class="absolute right-0 mt-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                >
                  <app-mini-login></app-mini-login>
                </div>
              </ng-container>

              <!-- Logged in: Avatar + Name + Caret -->
              <ng-template #userMenu>
                <ng-container *ngIf="currentUser$ | async as user">
                  <button
                    class="flex items-center gap-2 px-3 h-9 rounded-full
                           bg-primary/10 dark:bg-dark-primary/10
                           hover:bg-primary/20 dark:hover:bg-dark-primary/20
                           hover:shadow-sm
                           text-secondary dark:text-dark-secondary
                           transition-all duration-200 group/userbtn"
                  >
                    <img
                      [src]="user.avatarUrl"
                      alt="{{ user.name }}"
                      class="w-7 h-7 rounded-full object-cover ring-2 ring-primary/30 dark:ring-dark-primary/30"
                    />
                    <span class="text-sm font-medium">{{ user.name }}</span>
                    <i class="bi bi-caret-down-fill text-xs opacity-60 group-hover/userbtn:opacity-100 transition-opacity duration-150"></i>
                  </button>

                  <!-- User Dropdown -->
                  <div
                    class="absolute right-0 mt-2 w-52 rounded-2xl shadow-lg
                           bg-surface dark:bg-dark-surface
                           border border-primary/10 dark:border-dark-primary/10
                           py-2 z-50
                           opacity-0 invisible group-hover:opacity-100 group-hover:visible
                           transition-all duration-200"
                  >
                    <!-- My Reservations -->

                    <a routerLink="/reservations"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm
                    text-secondary dark:text-dark-secondary
                    hover:bg-primary/10 dark:hover:bg-dark-primary/10
                    hover:text-accent dark:hover:text-dark-accent
                    transition-colors duration-150 cursor-pointer"
                    >
                    <i class="bi bi-calendar-check text-base w-4 text-center"></i>
                    {{ 'navbar.myReservations' | translate }}
                    </a>

                    <!-- My Courses -->

                    <a routerLink="/courses"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm
                    text-secondary dark:text-dark-secondary
                    hover:bg-primary/10 dark:hover:bg-dark-primary/10
                    hover:text-accent dark:hover:text-dark-accent
                    transition-colors duration-150 cursor-pointer"
                    >
                    <i class="bi bi-book text-base w-4 text-center"></i>
                    {{ 'navbar.myCourses' | translate }}
                    </a>

                    <!-- Divider -->
                    <div class="my-2 border-t border-primary/10 dark:border-dark-primary/10"></div>

                    <!-- Logout -->
                    <button
                      (click)="logout()"
                      class="flex items-center gap-3 w-full px-4 py-2.5 text-sm
                             text-red-500 dark:text-red-400 rounded-sm
                    hover:bg-primary/10 dark:hover:bg-dark-primary/10
                                        hover:text-red-600 dark:hover:text-red-500

                             transition-colors duration-150 cursor-pointer"
                    >
                      <i class="bi bi-box-arrow-right text-base w-4 text-center"></i>
                      {{ 'navbar.logout' | translate }}
                    </button>
                  </div>
                </ng-container>
              </ng-template>
            </div>

            <!-- Preferences Dropdown (hover) -->
            <div class="relative group">
              <button
                class="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 dark:bg-dark-primary/10 hover:bg-primary/20 dark:hover:bg-dark-primary/20 text-secondary dark:text-dark-secondary transition-colors duration-200"
              >
                <i class="bi bi-sliders text-sm"></i>
              </button>

              <div
                class="absolute right-0 mt-2 w-52 rounded-2xl shadow-lg bg-surface dark:bg-dark-surface border border-primary/10 dark:border-dark-primary/10 p-4 z-50
                       opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
              >
                <p class="text-xs font-semibold uppercase tracking-widest text-secondary/50 dark:text-dark-secondary/50 mb-3">
                  {{ 'navbar.preferences' | translate }}
                </p>

                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm text-secondary dark:text-dark-secondary">
                    {{ 'navbar.theme' | translate }}
                  </span>
                  <app-dark-mode-toggle></app-dark-mode-toggle>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm text-secondary dark:text-dark-secondary">
                    {{ 'navbar.language' | translate }}
                  </span>
                  <app-language-toggle></app-language-toggle>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  currentUser$: Observable<User | null>;

  constructor(
    private translate: TranslateService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  logout(): void {
    console.log('[NavbarComponent] logout() called');

    this.authService.logout().subscribe({
      next: () => {
        console.log('[NavbarComponent] ✅ Logout HTTP call succeeded');
        console.log('[NavbarComponent] currentUser$ should now be null — check BehaviorSubject');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('[NavbarComponent] ❌ Logout HTTP call failed:', err);
        // currentUserSubject was already set to null in the service, so UI reflects logout regardless
        this.router.navigate(['/']);
      }
    });
  }
}
