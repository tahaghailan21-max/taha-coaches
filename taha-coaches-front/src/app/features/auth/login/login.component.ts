import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import {environment} from "../../../environments/environment";
import {User} from "../../../core/models/user.model";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background p-6">

      <!-- Login Card -->
      <div class="bg-surface dark:bg-dark-surface rounded-2xl shadow-2xl p-10 w-[380px] text-center
                  transform transition-all duration-300">

        <!-- Welcome Title -->
        <h1 class="text-4xl sm:text-5xl font-extrabold text-primary dark:text-dark-primary mb-4 sm:mb-6">
          Welcome!
        </h1>

        <p class="text-base sm:text-lg text-secondary dark:text-dark-secondary mb-8">
          Sign in with one of your socials:
        </p>

        <!-- Social Buttons -->
        <div class="flex flex-col gap-4">

          <!-- Google -->
          <button
            (click)="loginWithGoogle()"
            class="flex items-center justify-center gap-3 w-full bg-white dark:bg-gray-700
                   border border-gray-300 dark:border-gray-600 rounded-xl py-4 shadow-md
                   hover:shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600
                   transition-all duration-300 transform hover:-translate-y-1"
          >
            <svg class="w-5 h-5" viewBox="0 0 533.5 544.3">
              <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.4H272v95.4h146.9c-6.3 34-25 62.8-53.3 82l86.3 67.3c50.2-46.3 81.6-114.6 81.6-194.3z"/>
              <path fill="#34A853" d="M272 544.3c72.7 0 133.7-24 178.3-65.2l-86.3-67.3c-24 16.1-55 25.7-92 25.7-70.8 0-130.7-47.8-152-112.2l-88.1 68.4c43.2 85.1 130.2 150.6 240.1 150.6z"/>
              <path fill="#FBBC05" d="M120 326.5c-10.2-30.4-10.2-63.5 0-93.9l-88.1-68.4C6.6 220.2 0 245.5 0 272s6.6 51.8 31.9 107.9l88.1-68.4z"/>
              <path fill="#EA4335" d="M272 108.7c38.8-.6 73.7 13.7 101.1 39.5l75.6-75.6C404.8 24.6 344.7 0 272 0 162.1 0 75.1 65.5 31.9 150.6l88.1 68.4c21.3-64.4 81.2-112.2 152-110.3z"/>
            </svg>
            Google
          </button>

          <!-- Facebook -->
          <button
            class="flex items-center justify-center gap-3 w-full bg-[#1877F2] text-white
                   rounded-xl py-4 shadow-md hover:shadow-lg
                   transition-all duration-300 transform hover:-translate-y-1"
          >
            <i class="bi bi-facebook text-lg"></i>
            Facebook
          </button>

          <!-- Apple -->
          <button
            class="flex items-center justify-center gap-3 w-full bg-black text-white
                   rounded-xl py-4 shadow-md hover:shadow-lg
                   transition-all duration-300 transform hover:-translate-y-1"
          >
            <i class="bi bi-apple text-lg"></i>
            Apple
          </button>

          <!-- Twitter -->
          <button
            class="flex items-center justify-center gap-3 w-full bg-[#1DA1F2] text-white
                   rounded-xl py-4 shadow-md hover:shadow-lg
                   transition-all duration-300 transform hover:-translate-y-1"
          >
            <i class="bi bi-twitter text-lg"></i>
            Twitter
          </button>

        </div>

      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  constructor(private authService: AuthService) {}

  private apiUrl = environment.apiUrl;

  loginWithGoogle() {
    const width = 500;
    const height = 600;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    const backendOrigin = this.apiUrl;

    const listener = (event: MessageEvent) => {
      console.log('Message received:', event.data);
      // Optional: check origin
      const user = event.data as User;
      console.log('Logged in user:', user);
      window.removeEventListener('message', listener);
    };

    window.addEventListener('message', listener);

    const popup = window.open(
      `${backendOrigin}/oauth2/authorization/google`,
      'google-login',
      `width=${width},height=${height},top=${top},left=${left}`
    );
  }
}
