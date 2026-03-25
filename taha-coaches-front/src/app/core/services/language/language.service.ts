import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

const SUPPORTED_LANGS = ['en', 'fr'];
const STORAGE_KEY = 'app_lang';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  private isBrowser: boolean;

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  init() {
    this.translate.setDefaultLang('en');

    let lang = 'en';

    if (this.isBrowser) {
      // 1. Check localStorage
      const savedLang = localStorage.getItem(STORAGE_KEY);

      // 2. Browser language
      const browserLang = this.translate.getBrowserLang();

      lang = savedLang && SUPPORTED_LANGS.includes(savedLang)
        ? savedLang
        : (browserLang && SUPPORTED_LANGS.includes(browserLang) ? browserLang : 'en');
    }

    this.translate.use(lang);
  }

  setLanguage(lang: string) {
    if (!SUPPORTED_LANGS.includes(lang)) {
      return;
    }

    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, lang);
    }

    this.translate.use(lang).subscribe({
      error: () => {}
    });
  }

  getCurrentLang(): string {
    return this.translate.currentLang || this.translate.defaultLang || 'en';
  }
}
