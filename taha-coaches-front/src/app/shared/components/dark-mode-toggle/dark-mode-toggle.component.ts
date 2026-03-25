import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from "@angular/common";

@Component({
  selector: 'app-dark-mode-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dark-mode-toggle.component.html',
  styleUrl: './dark-mode-toggle.component.scss'
})
export class DarkModeToggleComponent implements OnInit {
  isDarkMode = false;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.isDarkMode = document.documentElement.classList.contains('dark');
  }

  toggleDarkMode() {
    if (!this.isBrowser) return;

    this.isDarkMode = !this.isDarkMode;
    // ✅ Save user preference
    localStorage.setItem('dark-mode', String(this.isDarkMode));

    // ✅ Apply immediately
    const html = document.documentElement;

    if (this.isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

}
