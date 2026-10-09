import { Directive, Injectable, inject, input } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, Subject, filter, switchMap, take } from 'rxjs';

/** "/blog/?ref=x#top" -> "blog": primero se corta query/fragmento y luego las barras. */
const normalize = (path: string): string => path.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');

/**
 * Precarga el chunk de una ruta lazy cuando el usuario muestra intención de visitarla
 * (hover, foco o toque en un enlace marcado con `appPrefetch`). No descarga nada por adelantado.
 */
@Injectable({
  providedIn: 'root'
})
export class IntentPreloadingStrategy implements PreloadingStrategy {
  private readonly requested = new Set<string>();
  private readonly intents = new Subject<string>();

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    const path = normalize(route.path ?? '');
    if (this.requested.has(path)) {
      return load();
    }
    return this.intents.pipe(
      filter((requested) => requested === path),
      take(1),
      switchMap(() => load())
    );
  }

  request(path: string): void {
    const normalized = normalize(path);
    if (this.requested.has(normalized) || saveDataEnabled()) {
      return;
    }
    this.requested.add(normalized);
    this.intents.next(normalized);
  }
}

/** Respeta el modo "Ahorro de datos" del navegador. */
const saveDataEnabled = (): boolean =>
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

@Directive({
  selector: 'a[appPrefetch]',
  host: {
    '(mouseenter)': 'prefetch()',
    '(focus)': 'prefetch()',
    '(touchstart)': 'prefetch()'
  }
})
export class PrefetchDirective {
  private readonly strategy = inject(IntentPreloadingStrategy);

  /** Ruta a precargar, p. ej. "/blog". */
  readonly appPrefetch = input.required<string>();

  prefetch(): void {
    this.strategy.request(this.appPrefetch());
  }
}
