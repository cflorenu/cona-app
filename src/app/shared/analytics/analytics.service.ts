import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, Directive, Injectable, PLATFORM_ID, inject, input } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Conversiones medidas (crear un "Goal" con el mismo nombre en Plausible). */
export type ConversionEvent = 'Clase gratis' | 'WhatsApp' | 'Contacto' | 'Solicitud clase gratis' | 'Newsletter';

type PlausibleFn = ((event: string, options?: { props: Record<string, string> }) => void) & { q?: unknown[] };

export const PLAUSIBLE_SCRIPT = 'https://plausible.io/js/script.js';

/**
 * Analítica sin cookies ni datos personales (Plausible): no requiere banner de consentimiento.
 * Desactivada mientras `analytics.plausibleDomain` esté vacío. Al activarla, añadir https://plausible.io
 * a script-src y connect-src de la CSP (public/.htaccess).
 */
@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  init(domain: string = environment.analytics.plausibleDomain): void {
    if (!this.isBrowser || !domain || this.document.querySelector(`script[src="${PLAUSIBLE_SCRIPT}"]`)) {
      return;
    }
    const window = this.document.defaultView as Window & { plausible?: PlausibleFn };
    // Cola oficial de Plausible: guarda los eventos hasta que carga el script.
    const queue: unknown[] = [];
    window.plausible ??= Object.assign((...args: unknown[]) => void queue.push(args), { q: queue });

    const script = this.document.createElement('script');
    script.defer = true;
    script.src = PLAUSIBLE_SCRIPT;
    script.dataset['domain'] = domain;
    this.document.head.appendChild(script);
  }

  track(event: ConversionEvent, props?: Record<string, string>): void {
    if (!this.isBrowser) {
      return;
    }
    const plausible = (this.document.defaultView as Window & { plausible?: PlausibleFn }).plausible;
    plausible?.(event, props ? { props } : undefined);
  }
}

/** Registra una conversión al hacer clic: `<a appTrack="WhatsApp" trackFrom="header">`. */
@Directive({
  selector: '[appTrack]',
  host: { '(click)': 'onClick()' }
})
export class TrackDirective {
  private readonly analytics = inject(AnalyticsService);

  readonly appTrack = input.required<ConversionEvent>();
  /** Ubicación del elemento (propiedad "desde" del evento). */
  readonly trackFrom = input<string>();

  onClick(): void {
    const from = this.trackFrom();
    this.analytics.track(this.appTrack(), from ? { desde: from } : undefined);
  }
}
