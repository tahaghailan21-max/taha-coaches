import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const SUPPORTED_LANGS = ['en', 'fr'];
const STORAGE_KEY = 'app_lang';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  constructor(private translate: TranslateService) {}

  init() {
    console.log('🌍 LanguageService init');

    this.translate.setDefaultLang('en');

    // 1. Check localStorage first
    const savedLang = localStorage.getItem(STORAGE_KEY);

    // 2. Otherwise use browser language
    const browserLang = this.translate.getBrowserLang();

    const lang = savedLang && SUPPORTED_LANGS.includes(savedLang)
      ? savedLang
      : (browserLang && SUPPORTED_LANGS.includes(browserLang) ? browserLang : 'en');

    console.log('🌍 Initial language:', lang);

    this.translate.use(lang);
  }

  setLanguage(lang: string) {
    if (!SUPPORTED_LANGS.includes(lang)) {
      console.warn('❌ Unsupported language:', lang);
      return;
    }

    console.log('🔁 Switching language to:', lang);

    localStorage.setItem(STORAGE_KEY, lang);

    this.translate.use(lang).subscribe({
      next: () => console.log('✅ Language switched to', lang),
      error: (err) => console.error('❌ Language load failed', err)
    });
  }

  getCurrentLang(): string {
    return this.translate.currentLang || this.translate.defaultLang || 'en';
  }
}
