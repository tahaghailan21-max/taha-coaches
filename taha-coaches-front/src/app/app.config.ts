import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";

import { routes } from './app.routes';

import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { AuthService } from './core/services/auth/auth.service';
import { LanguageService } from './core/services/language/language.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),

    provideHttpClient(
      withFetch(),
      withInterceptors([
        (req, next) => {
          const lang = inject(LanguageService).getCurrentLang();

          return next(req.clone({
            setHeaders: {
              'Accept-Language': lang
            }
          }));
        }
      ])
    ),

    importProvidersFrom(
      TranslateModule.forRoot({
        loader: provideTranslateHttpLoader({
          prefix: 'http://localhost:8080/api/public/i18n/',
          suffix: '',
        }),
      })
    ),

    {
      provide: APP_INITIALIZER,
      useFactory: (auth: AuthService) => () => auth.getCurrentUser(),
      deps: [AuthService],
      multi: true
    }
  ]
};
