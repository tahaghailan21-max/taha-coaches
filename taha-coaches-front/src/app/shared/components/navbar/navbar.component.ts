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

            <!-- Login / Avatar Button -->
            <div class="relative group">
              <button
                class="flex items-center gap-2 px-4 h-8 rounded-full bg-primary dark:bg-dark-primary text-white dark:text-dark-background hover:bg-opacity-90 transition"
              >
                <!-- Avatar if logged in -->
                <ng-container *ngIf="currentUser$ | async as user; else loginIcon">
                  <img [src]="user.avatarUrl" alt="{{user.name}}" class="w-8 h-8 rounded-full object-cover"/>
                </ng-container>

                <!-- Default login icon if not logged in -->
                <ng-template #loginIcon>
                  <i class="bi bi-person-fill"></i>
                  {{ 'navbar.login' | translate }}
                </ng-template>
              </button>

              <!-- Mini Login Dropdown -->
              <div
                class="absolute right-0 mt-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
              >
                <app-mini-login></app-mini-login>
              </div>
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
export class NavbarComponent implements OnInit {
  currentUser$: Observable<User | null>;

  constructor(private translate: TranslateService, private authService: AuthService) {
    // ✅ Subscribe to currentUser BehaviorSubject
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    // ✅ Load the user on page refresh so avatar persists
    this.authService.getCurrentUser();
  }
}
