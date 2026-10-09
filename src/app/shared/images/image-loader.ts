import { IMAGE_CONFIG, IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { Provider } from '@angular/core';
import { IMAGE_BREAKPOINTS, IMAGE_WIDTHS } from './image-manifest';

export const OPTIMIZED_DIR = 'assets/optimized';
const ASSET_PATTERN = /^\/?assets\/([^/]+)\.(?:jpe?g|png|webp)$/i;

/**
 * Loader de NgOptimizedImage que sirve las variantes WebP generadas por `npm run images`.
 * Elige la variante más pequeña que cubra el ancho pedido; sin variantes (SVG, externas) devuelve el original.
 */
export const optimizedImageLoader = ({ src, width }: ImageLoaderConfig): string => {
  const name = ASSET_PATTERN.exec(src)?.[1];
  const widths = name ? IMAGE_WIDTHS[name] : undefined;
  if (!widths) {
    return src;
  }
  const largest = widths[widths.length - 1];
  const chosen = width ? (widths.find((w) => w >= width) ?? largest) : largest;
  return `${OPTIMIZED_DIR}/${name}-${chosen}.webp`;
};

export const provideOptimizedImages = (): Provider[] => [
  { provide: IMAGE_LOADER, useValue: optimizedImageLoader },
  { provide: IMAGE_CONFIG, useValue: { breakpoints: [...IMAGE_BREAKPOINTS] } }
];
