import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-dark-mode-toggle',
  standalone: true,
  imports: [],
  templateUrl: './dark-mode-toggle.component.html',
  styleUrl: './dark-mode-toggle.component.scss'
})
export class DarkModeToggleComponent implements OnInit{
  isDarkMode = false;

  constructor() { }

  ngOnInit(): void {
    // Check localStorage or system preference
    const savedMode = localStorage.getItem('dark-mode');
    if (savedMode) {
      this.isDarkMode = savedMode === 'true';
      this.updateHtmlClass();
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('dark-mode', String(this.isDarkMode));
    this.updateHtmlClass();
  }

  updateHtmlClass() {
    const html = document.documentElement;
    if (this.isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}
