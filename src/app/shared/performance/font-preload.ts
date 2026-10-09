import { DOCUMENT, DestroyRef, inject } from '@angular/core';

export const DISPLAY_FONT_URL = '/assets/fonts/bebas-neue-latin-400-normal.woff2';

/**
 * Precarga una fuente solo en las páginas que la usan above-the-fold (evita el salto de tipografía en el hero
 * sin penalizar al resto). Debe llamarse en un contexto de inyección; en el prerender queda en el HTML estático.
 */
export const preloadFont = (href: string = DISPLAY_FONT_URL): void => {
  const document = inject(DOCUMENT);
  if (document.head.querySelector(`link[rel="preload"][href="${href}"]`)) {
    return;
  }
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.type = 'font/woff2';
  link.href = href;
  // Las fuentes se piden siempre en modo CORS: sin crossorigin la precarga no se reutiliza.
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
  inject(DestroyRef).onDestroy(() => link.remove());
};
