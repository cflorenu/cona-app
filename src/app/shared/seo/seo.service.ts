import { DOCUMENT, DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';
import { absoluteUrl } from './structured-data';

/** Datos SEO por ruta (en `data` de cada Route). */
export interface RouteSeo {
  description?: string;
  /** Ruta de la imagen para compartir (1200x630). */
  image?: string;
  /** Excluir de buscadores (p. ej. la página 404). */
  noindex?: boolean;
}

export const SITE_NAME = 'Con Atletas Sur';
export const DEFAULT_DESCRIPTION =
  'Academia de artes marciales en Villa El Salvador: Jiu Jitsu, Muay Thai, Sambo, Boxeo y clases privadas.';
export const DEFAULT_OG_IMAGE = { path: 'assets/og/og-default.jpg', width: 1200, height: 630 };

/**
 * Metadatos por página: descripción, Open Graph (WhatsApp, Facebook), Twitter Card, canonical y robots.
 * Se registra solo en el servidor (app.config.server.ts): los crawlers leen el HTML prerenderizado de cada URL,
 * así que el navegador no necesita descargar este código.
 */
@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly document = inject(DOCUMENT);

  /** Empieza a actualizar los metadatos en cada navegación. */
  init(destroyRef: DestroyRef = inject(DestroyRef)): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((event) => {
        const route = this.deepest(this.router.routerState.snapshot.root);
        // El TitleStrategy del router actualiza <title> después de NavigationEnd: se usa el título resuelto de la ruta.
        this.apply(route.data as RouteSeo, event.urlAfterRedirects, environment.siteUrl, route.title);
      });
  }

  apply(seo: RouteSeo, url: string, siteUrl: string, routeTitle?: string): void {
    const path = url.split(/[?#]/)[0];
    const description = seo.description ?? DEFAULT_DESCRIPTION;
    const title = routeTitle ?? this.title.getTitle();
    const pageUrl = absoluteUrl(siteUrl, path.replace(/^\//, ''));
    const image = absoluteUrl(siteUrl, seo.image ?? DEFAULT_OG_IMAGE.path);

    this.setName('description', description);
    this.setName('robots', seo.noindex ? 'noindex, follow' : 'index, follow');
    this.setProperty('og:type', 'website');
    this.setProperty('og:site_name', SITE_NAME);
    this.setProperty('og:locale', 'es_PE');
    this.setProperty('og:title', title);
    this.setProperty('og:description', description);
    this.setName('twitter:card', 'summary_large_image');
    this.setName('twitter:title', title);
    this.setName('twitter:description', description);

    // Open Graph exige URLs absolutas: sin dominio configurado se omiten URL e imagen.
    this.setProperty('og:url', pageUrl);
    this.setProperty('og:image', image);
    this.setProperty('og:image:width', image && String(DEFAULT_OG_IMAGE.width));
    this.setProperty('og:image:height', image && String(DEFAULT_OG_IMAGE.height));
    this.setProperty('og:image:alt', image && `${SITE_NAME}: ${description}`);
    this.setName('twitter:image', image);
    this.setCanonical(pageUrl);
  }

  private deepest(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    let current = route;
    while (current.firstChild) {
      current = current.firstChild;
    }
    return current;
  }

  private setName(name: string, content: string | undefined): void {
    this.upsert(`name="${name}"`, { name, content });
  }

  private setProperty(property: string, content: string | undefined): void {
    this.upsert(`property="${property}"`, { property, content });
  }

  private upsert(selector: string, tag: { name?: string; property?: string; content: string | undefined }): void {
    if (tag.content === undefined) {
      this.meta.removeTag(selector);
      return;
    }
    this.meta.updateTag({ ...tag, content: tag.content } as Record<string, string>, selector);
  }

  private setCanonical(url: string | undefined): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!url) {
      link?.remove();
      return;
    }
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }
}
