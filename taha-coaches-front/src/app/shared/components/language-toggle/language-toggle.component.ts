import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {CommonModule} from "@angular/common";
import {SharedTranslateModule} from "../../../core/shared-translate.module";

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  template: `
    <div class="flex items-center space-x-1">
      <button
        *ngFor="let lang of languages"
        (click)="setLanguage(lang)"
        [class.font-bold]="translate.currentLang === lang"
        class="px-2 py-1 rounded hover:bg-primary/20 dark:hover:bg-dark-primary/20 transition"
      >
        {{ lang.toUpperCase() }}
      </button>
    </div>
  `,
  styles: [`
    button { cursor: pointer; }
  `],
  imports: [CommonModule, SharedTranslateModule]
})
export class LanguageToggleComponent {
  languages = ['en', 'fr'];

  constructor(public translate: TranslateService) {}

  setLanguage(lang: string) {
    this.translate.use(lang);
  }
}
