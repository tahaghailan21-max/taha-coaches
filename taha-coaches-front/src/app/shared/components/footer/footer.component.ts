import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
<footer class="bg-surface dark:bg-dark-surface text-secondary dark:text-dark-secondary">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

    <!-- About Section -->
    <div>
      <h3 class="text-primary dark:text-dark-primary font-bold text-lg mb-3">
        {{ 'footer.title' | translate }}
      </h3>
      <p class="text-secondary dark:text-dark-secondary text-sm">
        {{ 'footer.aboutText' | translate }}
      </p>
    </div>

    <!-- Social Media Links -->
    <div>
      <h3 class="text-primary dark:text-dark-primary font-bold text-lg mb-3">
        {{ 'footer.socialTitle' | translate }}
      </h3>
      <ul class="space-y-2">
        <li>
          <a href="https://www.instagram.com/taha.ghailan" target="_blank"
             class="hover:text-primary dark:hover:text-dark-primary">
            Instagram
          </a>
        </li>
        <li>
          <a href="https://www.facebook.com/taha.ghailan" target="_blank"
             class="hover:text-primary dark:hover:text-dark-primary">
            Facebook
          </a>
        </li>
        <li>
          <a href="https://www.linkedin.com/in/taha-ghailan" target="_blank"
             class="hover:text-primary dark:hover:text-dark-primary">
            LinkedIn
          </a>
        </li>
      </ul>
    </div>

    <!-- Contact Info -->
    <div>
      <h3 class="text-primary dark:text-dark-primary font-bold text-lg mb-3">
        {{ 'footer.contactTitle' | translate }}
      </h3>
      <ul class="space-y-2 text-sm">
        <li>Email:
          <a href="mailto:tahatrains20@gmail.com" class="hover:text-primary dark:hover:text-dark-primary">
            tahatrains20&#64;gmail.com
          </a>
        </li>
        <li>Phone:
          <a href="tel:+212770257206" class="hover:text-primary dark:hover:text-dark-primary">
            0770257206
          </a>
        </li>
        <li>Location: Casablanca, Morocco</li>
      </ul>
    </div>

  </div>

  <!-- Bottom bar -->
  <div class="border-t border-secondary dark:border-dark-secondary mt-4 py-4 text-center text-sm">
    © {{ currentYear }} Taha Coaches. {{ 'footer.rightsReserved' | translate }}
  </div>
</footer>
  `
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();

  constructor(private translate: TranslateService) {}
}
