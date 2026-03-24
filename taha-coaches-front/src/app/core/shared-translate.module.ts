// src/app/core/shared-translate.module.ts
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

@NgModule({
  imports: [
    HttpClientModule,
    TranslateModule.forRoot({
      loader: provideTranslateHttpLoader({
        prefix: 'http://localhost:8080/api/public/i18n/', // full URL to backend
        suffix: '',           // no file extension, since backend returns JSON
      }),
    }),
  ],
  exports: [TranslateModule],
})
export class SharedTranslateModule {}
