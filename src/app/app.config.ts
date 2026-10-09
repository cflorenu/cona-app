import { ApplicationConfig, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withPreloading } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withNoIncrementalHydration } from '@angular/platform-browser';

import { AnalyticsService } from './shared/analytics/analytics.service';
import { provideOptimizedImages } from './shared/images/image-loader';
import { IntentPreloadingStrategy } from './shared/performance/intent-preloading.strategy';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      withPreloading(IntentPreloadingStrategy)
    ),
    provideHttpClient(withFetch()),
    provideClientHydration(withNoIncrementalHydration()),
    ...provideOptimizedImages(),
    provideAppInitializer(() => inject(AnalyticsService).init())
  ]
};
