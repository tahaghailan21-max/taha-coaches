import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";
import { DarkModeToggleComponent } from "../dark-mode-toggle/dark-mode-toggle.component";
import { LanguageToggleComponent } from "../language-toggle/language-toggle.component";
import { CommonModule } from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';
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
    <nav class="bg-surface dark:bg-dark-surface shadow-md sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">

          <!-- Logo -->
          <div class="flex-shrink-0">
            <a routerLink="/"
               class="text-primary dark:text-dark-primary font-bold text-xl
                       hover:text-accent dark:hover:text-dark-accent transition-colors duration-200"
            >
              <img src="../../../../assets/logo-removebg-preview.png" class="w-16 sm:w-20 block dark:hidden"/>
              <img src="../../../../assets/logo-removebg-light-mode.png" class="w-16 sm:w-20 hidden dark:block"/>
            </a>
          </div>

          <!-- Navigation Links (Center) -->
          <div class="hidden md:flex items-center space-x-1 mx-auto h-full">
            <a routerLink="/" routerLinkActive="!bg-primary/10 dark:!bg-dark-primary/10 !text-primary dark:!text-dark-primary font-semibold" [routerLinkActiveOptions]="{exact: true}"
               class="nav-link text-secondary dark:text-dark-secondary hover:text-accent dark:hover:text-dark-accent hover:bg-primary/10 dark:hover:bg-dark-primary/10">
              {{ 'navbar.home' | translate }}
            </a>
            <a routerLink="/services" routerLinkActive="!bg-primary/10 dark:!bg-dark-primary/10 !text-primary dark:!text-dark-primary font-semibold" class="nav-link text-secondary dark:text-dark-secondary hover:text-accent dark:hover:text-dark-accent hover:bg-primary/10 dark:hover:bg-dark-primary/10">
              {{ 'navbar.services' | translate }}
            </a>
            <a routerLink="/contact" routerLinkActive="!bg-primary/10 dark:!bg-dark-primary/10 !text-primary dark:!text-dark-primary font-semibold" class="nav-link text-secondary dark:text-dark-secondary hover:text-accent dark:hover:text-dark-accent hover:bg-primary/10 dark:hover:bg-dark-primary/10">
              {{ 'navbar.contact' | translate }}
            </a>

            <!-- Primary CTA: booking -->
            <a routerLink="/book"
               class="ml-2 flex items-center gap-2 px-5 h-10 rounded-full
                      bg-primary dark:bg-dark-primary text-white dark:text-dark-background
                      font-semibold text-sm shadow-sm
                      hover:shadow-md hover:opacity-90 transition-all duration-200">
              <i class="bi bi-calendar-plus"></i>
              {{ 'navbar.book' | translate }}
            </a>
          </div>

          <!-- Right-side controls -->
          <div class="flex items-center space-x-3">

            <!-- Admin shortcut (visible for admins only) -->
            <ng-container *ngIf="(currentUser$ | async)?.role === 'ADMIN'">
              <a routerLink="/admin"
                 class="hidden sm:flex items-center gap-2 px-3 h-8 rounded-full
                        bg-accent/10 dark:bg-dark-accent/10 text-accent dark:text-dark-accent
                        text-sm font-semibold hover:bg-accent/20 dark:hover:bg-dark-accent/20
                        transition-colors duration-200">
                <i class="bi bi-shield-lock"></i>
                {{ 'navbar.admin' | translate }}
              </a>
            </ng-container>

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
                    <span class="text-sm font-medium hidden sm:inline">{{ user.name }}</span>
                    <i class="bi bi-caret-down-fill text-xs opacity-60 group-hover/userbtn:opacity-100 transition-opacity duration-150"></i>
                  </button>

                  <!-- User Dropdown -->
                  <div
                    class="absolute right-0 mt-2 w-56 rounded-2xl shadow-lg
                           bg-surface dark:bg-dark-surface
                           border border-primary/10 dark:border-dark-primary/10
                           py-2 z-50
                           opacity-0 invisible group-hover:opacity-100 group-hover:visible
                           transition-all duration-200"
                  >
                    <!-- Book a session -->
                    <a routerLink="/book" class="menu-item text-secondary dark:text-dark-secondary hover:bg-primary/10 dark:hover:bg-dark-primary/10 hover:text-accent dark:hover:text-dark-accent">
                      <i class="bi bi-calendar-plus text-base w-4 text-center"></i>
                      {{ 'navbar.book' | translate }}
                    </a>

                    <!-- My Reservations -->
                    <a routerLink="/my-reservations" class="menu-item text-secondary dark:text-dark-secondary hover:bg-primary/10 dark:hover:bg-dark-primary/10 hover:text-accent dark:hover:text-dark-accent">
                      <i class="bi bi-calendar-check text-base w-4 text-center"></i>
                      {{ 'navbar.myReservations' | translate }}
                    </a>

                    <!-- Messages -->
                    <a [routerLink]="user.role === 'ADMIN' ? '/admin/chat' : '/chat'" class="menu-item text-secondary dark:text-dark-secondary hover:bg-primary/10 dark:hover:bg-dark-primary/10 hover:text-accent dark:hover:text-dark-accent">
                      <i class="bi bi-chat-dots text-base w-4 text-center"></i>
                      {{ 'navbar.messages' | translate }}
                    </a>

                    <!-- Admin (admins only) -->
                    <ng-container *ngIf="user.role === 'ADMIN'">
                      <div class="my-2 border-t border-primary/10 dark:border-dark-primary/10"></div>
                      <a routerLink="/admin/reservations" class="menu-item text-secondary dark:text-dark-secondary hover:bg-primary/10 dark:hover:bg-dark-primary/10 hover:text-accent dark:hover:text-dark-accent">
                        <i class="bi bi-inbox text-base w-4 text-center"></i>
                        {{ 'navbar.adminReservations' | translate }}
                      </a>
                      <a routerLink="/admin/availability" class="menu-item text-secondary dark:text-dark-secondary hover:bg-primary/10 dark:hover:bg-dark-primary/10 hover:text-accent dark:hover:text-dark-accent">
                        <i class="bi bi-clock-history text-base w-4 text-center"></i>
                        {{ 'navbar.adminAvailability' | translate }}
                      </a>
                    </ng-container>

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
  `,
  styles: [`
    .nav-link {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 1.1rem;
      border-radius: 9999px;
      font-size: 0.9rem;
      transition: all .15s ease;
    }
    .menu-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
      transition: all .15s ease;
      cursor: pointer;
    }
  `]
})
export class NavbarComponent {
  currentUser$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.router.navigate(['/'])
    });
  }
}
