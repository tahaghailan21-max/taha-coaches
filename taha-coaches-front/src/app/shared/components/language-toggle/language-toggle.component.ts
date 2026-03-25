import { Component } from '@angular/core';
import { CommonModule } from "@angular/common";
import {LanguageService} from "../../../core/services/language/language.service";

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center space-x-1">
      <button
        *ngFor="let lang of languages"
        (click)="setLanguage(lang)"
        [class.font-bold]="currentLang === lang"
        class="px-2 py-1 rounded hover:bg-primary/20 dark:hover:bg-dark-primary/20 transition"
      >
        {{ lang.toUpperCase() }}
      </button>
    </div>
  `
})
export class LanguageToggleComponent {

  languages = ['en', 'fr'];

  constructor(private languageService: LanguageService) {}

  get currentLang() {
    return this.languageService.getCurrentLang();
  }

  setLanguage(lang: string) {
    this.languageService.setLanguage(lang);
  }
}
