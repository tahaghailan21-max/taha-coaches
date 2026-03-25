import { Component, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { LanguageService } from "../../../core/services/language/language.service";

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="relative w-14 h-8 rounded-full cursor-pointer bg-primary/20 dark:bg-dark-primary/20 p-1 transition-colors duration-300"
      (click)="toggleLanguage()"
    >
      <!-- Sliding knob -->
      <div
        class="w-6 h-6 rounded-full bg-white shadow-md absolute top-1 transition-transform duration-300 flex items-center justify-center overflow-hidden"
        [ngStyle]="{'transform': currentLang === 'en' ? 'translateX(0)' : 'translateX(24px)'}"
      >
        <img
          [src]="currentLang === 'en' ? 'assets/flags/uk.png' : 'assets/flags/fr.png'"
          [alt]="currentLang === 'en' ? 'UK flag' : 'FR flag'"
          class="w-full h-full object-cover rounded-full"
        />
      </div>

      <!-- Static labels -->
      <span
        class="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-semibold transition-opacity duration-300 text-secondary dark:text-dark-secondary"
        [ngStyle]="{'opacity': currentLang === 'fr' ? '1' : '0'}"
      >Fr</span>
      <span
        class="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold transition-opacity duration-300 text-secondary dark:text-dark-secondary"
        [ngStyle]="{'opacity': currentLang === 'en' ? '1' : '0'}"
      >En</span>
    </div>
  `,
  styles: [`div { user-select: none; }`]
})
export class LanguageToggleComponent implements OnInit {
  currentLang: 'en' | 'fr' = 'en';

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.currentLang = this.languageService.getCurrentLang() as 'en' | 'fr';
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === 'en' ? 'fr' : 'en';
    this.languageService.setLanguage(this.currentLang);
  }
}
