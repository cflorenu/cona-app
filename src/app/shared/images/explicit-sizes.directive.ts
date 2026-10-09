import { NgOptimizedImage } from '@angular/common';
import { Directive, input } from '@angular/core';

/**
 * NgOptimizedImage antepone "auto, " a `sizes` en imágenes lazy. Medido en Chrome: con `sizes="auto, …"`
 * cada imagen diferida se descarga dos veces (primero la variante máxima como si fuera 100vw y luego la correcta).
 * Esta directiva fija el valor responsivo declarado; el lazy loading nativo se mantiene.
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector -- se aplica sola sobre toda imagen NgOptimizedImage con sizes
  selector: 'img[ngSrc][sizes]',
  host: { '[attr.sizes]': 'sizes()' }
})
export class ExplicitSizesDirective {
  readonly sizes = input.required<string>();
}

/** Importar en lugar de NgOptimizedImage para obtener imágenes responsivas sin doble descarga. */
export const OPTIMIZED_IMAGE = [NgOptimizedImage, ExplicitSizesDirective] as const;
