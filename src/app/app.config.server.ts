import { provideServerRendering } from '@angular/ssr';
import { ApplicationConfig, inject, mergeApplicationConfig, provideAppInitializer } from '@angular/core';
import { appConfig } from './app.config';
import { SeoService } from './shared/seo/seo.service';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    // Metadatos SEO/Open Graph solo en el prerender (ver SeoService).
    provideAppInitializer(() => inject(SeoService).init())
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
