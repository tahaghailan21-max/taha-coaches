import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background p-6">
      <div class="bg-surface dark:bg-dark-surface rounded-2xl shadow-lg p-10 w-full max-w-2xl text-center">
        <h1 class="text-4xl font-bold text-primary dark:text-dark-primary mb-6">
          Contact Me
        </h1>
        <p class="text-lg text-secondary dark:text-dark-secondary">
          Here's how to contact me:
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class ContactComponent {}
