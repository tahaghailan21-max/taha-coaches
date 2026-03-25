import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
<div class="min-h-screen bg-background dark:bg-dark-background flex flex-col items-center justify-start">

  <!-- HERO SECTION WITH BACKGROUND -->
  <section
    class="w-full min-h-screen bg-cover relative flex items-center justify-center px-6"
    style="
      background-image: url('/assets/handstand-nature2.jpeg');
      background-position: center 75%;
      background-size: cover;
      background-repeat: no-repeat;
    "
  >
    <!-- Overlay -->
    <div class="absolute inset-0 bg-black/60"></div>

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto py-20">

      <h1 class="text-5xl font-bold text-white mb-4">
        {{ 'home.heroTitle' | translate }}
      </h1>

      <p class="text-lg text-gray-200 mb-8">
        {{ 'home.heroDescription' | translate }}
      </p>

      <!-- PERSONAL CARD -->
      <div class="p-6 rounded-xl max-w-xl text-left"
           style="background: rgba(255,255,255,0.08); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.18);">
        <p class="text-gray-100 mb-2">
          {{ 'home.intro1' | translate:{name: 'Taha'} }}
        </p>
        <p class="text-gray-100 mb-2">
          {{ 'home.intro2' | translate }}
        </p>
        <p class="text-gray-100 mb-2">
          {{ 'home.intro3' | translate }}
        </p>
        <p class="font-semibold text-white">
          {{ 'home.introQuote' | translate }}
        </p>
      </div>
    </div>
  </section>

  <!-- VIDEO SECTION -->
  <section class="mb-24 w-full max-w-6xl px-6 mt-16">

    <h2 class="text-3xl font-bold text-primary dark:text-dark-primary text-center mb-12">
      {{ 'home.videoSectionTitle' | translate }}
    </h2>

    <!-- ACHIEVEMENTS VIDEOS -->
    <div class="mb-16">
      <h3 class="text-2xl font-semibold text-accent dark:text-dark-accent text-center mb-8">
        {{ 'home.achievementsTitle' | translate }}
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
        <div class="flex flex-col items-center" *ngFor="let video of achievementVideos">
          <p class="mb-3 text-accent dark:text-dark-accent font-bold text-lg text-center">
            {{ video.title | translate }}
          </p>
          <iframe class="w-full h-64 rounded-xl shadow-md" [src]="video.url" frameborder="0" allowfullscreen></iframe>
        </div>
      </div>
    </div>

    <!-- STYLISH PROGRESS VIDEOS -->
    <div *ngIf="showMoreVideos" class="mb-24">
      <h3 class="text-2xl font-semibold text-accent dark:text-dark-accent text-center mb-8">
        {{ 'home.progressTitle' | translate }}
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 p-6 rounded-2xl
                  bg-white/60 dark:bg-gray-800/30 backdrop-blur-md
                  border border-gray-300 dark:border-gray-600 shadow-md">
        <div class="flex flex-col items-center" *ngFor="let video of progressVideos">
          <p class="mb-3 text-accent dark:text-dark-accent font-bold text-lg text-center">
            {{ video.title | translate }}
          </p>
          <iframe class="w-full h-64 rounded-xl shadow-md" [src]="video.url" frameborder="0" allowfullscreen></iframe>
        </div>
      </div>
    </div>

    <!-- See More Button -->
    <div class="flex justify-center mt-10">
      <button
        (click)="toggleVideos()"
        class="px-6 py-2 rounded-full border-2 border-accent dark:border-dark-accent
         text-accent dark:text-dark-accent font-semibold
         hover:bg-accent hover:text-white
         dark:hover:bg-dark-accent dark:hover:text-black
         transition-all flex items-center gap-2"
      >
        <span>{{ showMoreVideos ? ('home.seeLess' | translate) : ('home.seeMore' | translate) }}</span>
        <svg xmlns="http://www.w3.org/2000/svg"
             class="w-4 h-4 transition-transform duration-300"
             [style.transform]="showMoreVideos ? 'rotate(180deg)' : 'rotate(0deg)'"
             viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>
  </section>

  <!-- SOLUTION SECTION -->
  <section id="coaching" class="mb-20 text-center max-w-4xl px-6">
    <h2 class="text-4xl font-bold text-primary dark:text-dark-primary mb-4">
      {{ 'home.solutionTitle' | translate }}
    </h2>
    <p class="text-secondary dark:text-dark-secondary mb-6">
      {{ 'home.solutionDescription' | translate }}
    </p>
  </section>

  <!-- COMPARISON SECTION -->
  <section class="mb-20 w-full max-w-5xl px-6">
    <h2 class="text-4xl font-bold text-primary dark:text-dark-primary text-center mb-8">
      {{ 'home.comparisonTitle' | translate }}
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow-md">
        <h3 class="text-2xl font-bold text-primary dark:text-dark-primary mb-4">
          {{ 'home.withoutGuidanceTitle' | translate }}
        </h3>
        <ul class="text-secondary dark:text-dark-secondary list-disc list-inside space-y-2">
          <li *ngFor="let item of withoutGuidance">{{ item | translate }}</li>
        </ul>
      </div>

      <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow-md">
        <h3 class="text-2xl font-bold text-primary dark:text-dark-primary mb-4">
          {{ 'home.withGuidanceTitle' | translate }}
        </h3>
        <ul class="text-secondary dark:text-dark-secondary list-disc list-inside space-y-2">
          <li *ngFor="let item of withGuidance">{{ item | translate }}</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="mb-20 text-center px-6">
    <h2 class="text-4xl font-bold text-primary dark:text-dark-primary mb-4">
      {{ 'home.ctaTitle' | translate }}
    </h2>
    <p class="text-secondary dark:text-dark-secondary mb-6">
      {{ 'home.ctaDescription' | translate }}
    </p>
  </section>

  <!-- FOOTER -->
  <footer class="flex w-full mb-12 pl-12 md:pl-24">
    <div class="inline-flex items-center gap-4 p-4 rounded-full shadow-md
                bg-gradient-to-r from-slate-200 via-gray-100 to-stone-200
                dark:from-slate-800 dark:via-gray-800 dark:to-stone-700">
      <img src="/assets/cropped-avatar1.jpeg"
           alt="Taha Ghailan"
           class="w-16 h-16 rounded-full object-cover border-2 border-accent flex-shrink-0">
      <div class="flex flex-col justify-center">
        <p class="text-sm text-secondary dark:text-dark-secondary">
          {{ 'home.footerMadeBy' | translate }}
          <a href="https://www.instagram.com/taha.ghailan" target="_blank"
             class="font-semibold text-accent dark:text-dark-accent hover:underline">
            Taha Ghailan
          </a>
        </p>
        <div class="flex items-center gap-2 mt-1 text-sm text-secondary dark:text-dark-secondary">
          <i class="bi bi-envelope-fill text-accent dark:text-dark-accent"></i>
          <a href="mailto:tahatrains20@gmail.com" class="hover:underline">tahatrains20&#64;gmail.com</a>
        </div>
      </div>
    </div>
  </footer>

</div>
  `
})
export class HomeComponent {

  constructor(private translate: TranslateService, private sanitizer: DomSanitizer) {
    this.achievementVideos = [
      { title: 'home.video1', url: this.safeUrl('https://www.youtube.com/embed/e3AqMhlQwII') },
      { title: 'home.video2', url: this.safeUrl('https://www.youtube.com/embed/L2qiRnINhoA') },
      { title: 'home.video3', url: this.safeUrl('https://www.youtube.com/embed/7RR2e0mTD64') },
      { title: 'home.video4', url: this.safeUrl('https://www.youtube.com/embed/6RAIWr0gWDw?start=51') }
    ];

    this.progressVideos = [
      { title: 'home.video5', url: this.safeUrl('https://www.youtube.com/embed/RVKF67doUAo') },
      { title: 'home.video6', url: this.safeUrl('https://www.youtube.com/embed/lL72Yl7yhOE') }
    ];
  }

  showMoreVideos = false;

  achievementVideos: { title: string; url: SafeResourceUrl }[] = [];
  progressVideos: { title: string; url: SafeResourceUrl }[] = [];

  private safeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }


  withoutGuidance = [
    'home.withoutGuidance1',
    'home.withoutGuidance2',
    'home.withoutGuidance3',
    'home.withoutGuidance4',
    'home.withoutGuidance5',
    'home.withoutGuidance6'
  ];

  withGuidance = [
    'home.withGuidance1',
    'home.withGuidance2',
    'home.withGuidance3',
    'home.withGuidance4',
    'home.withGuidance5',
    'home.withGuidance6'
  ];


  toggleVideos(): void {
    this.showMoreVideos = !this.showMoreVideos;
  }
}
