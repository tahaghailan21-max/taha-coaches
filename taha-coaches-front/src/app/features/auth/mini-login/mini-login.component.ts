import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mini-login',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <!-- Mini Login Dropdown (styled like preferences) -->
    <div
      class="w-52 rounded-2xl shadow-lg bg-surface dark:bg-dark-surface border border-primary/10 dark:border-dark-primary/10 p-4"
    >
      <p class="text-xs font-semibold uppercase tracking-widest text-secondary/50 dark:text-dark-secondary/50 mb-3">
        {{ 'navbar.login' | translate }}
      </p>

      <!-- Social Login Buttons -->
      <div class="flex flex-col gap-3">
        <button
          (click)="loginWithGoogle()"
          class="flex items-center justify-center gap-2 w-full text-black dark:text-white bg-white dark:bg-gray-700
                 border border-gray-300 dark:border-gray-600 rounded-lg py-2 shadow-sm
                 hover:shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition transform hover:-translate-y-0.5"
        >
          <svg class="w-4 h-4" viewBox="0 0 533.5 544.3">
            <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.4H272v95.4h146.9c-6.3 34-25 62.8-53.3 82l86.3 67.3c50.2-46.3 81.6-114.6 81.6-194.3z"/>
            <path fill="#34A853" d="M272 544.3c72.7 0 133.7-24 178.3-65.2l-86.3-67.3c-24 16.1-55 25.7-92 25.7-70.8 0-130.7-47.8-152-112.2l-88.1 68.4c43.2 85.1 130.2 150.6 240.1 150.6z"/>
            <path fill="#FBBC05" d="M120 326.5c-10.2-30.4-10.2-63.5 0-93.9l-88.1-68.4C6.6 220.2 0 245.5 0 272s6.6 51.8 31.9 107.9l88.1-68.4z"/>
            <path fill="#EA4335" d="M272 108.7c38.8-.6 73.7 13.7 101.1 39.5l75.6-75.6C404.8 24.6 344.7 0 272 0 162.1 0 75.1 65.5 31.9 150.6l88.1 68.4c21.3-64.4 81.2-112.2 152-110.3z"/>
          </svg>
          {{ 'login.google' | translate }}
        </button>

        <button
          (click)="loginWithFacebook()"
          class="flex items-center justify-center gap-2 w-full bg-[#1877F2] text-white rounded-lg py-2 shadow-sm
                 hover:shadow-md transition transform hover:-translate-y-0.5"
        >
          <i class="bi bi-facebook text-lg"></i>
          {{ 'login.facebook' | translate }}
        </button>

        <p *ngIf="error" class="text-red-500 text-sm mt-1">
          {{ 'login.error' | translate }}
        </p>
      </div>
    </div>
  `
})
export class MiniLoginComponent {
  error = false;

  constructor(private authService: AuthService) {}

  loginWithGoogle() {
    this.authService.loginWithProvider('google')
      .then(() => this.error = false)
      .catch(() => this.error = true);
  }

  loginWithFacebook() {
    this.authService.loginWithProvider('facebook')
      .then(() => this.error = false)
      .catch(() => this.error = true);
  }
}
