import { Component, DOCUMENT, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { DEFAULT_DESCRIPTION, SeoService } from './seo.service';

@Component({ template: '' })
class PageComponent {}

describe('SeoService', () => {
  let service: SeoService;
  let meta: Meta;
  let doc: Document;

  const content = (selector: string): string | null => meta.getTag(selector)?.content ?? null;
  const canonical = (): HTMLLinkElement | null => doc.head.querySelector('link[rel="canonical"]');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: PageComponent, title: 'Inicio', data: { description: 'Portada' } },
          {
            path: 'padre',
            children: [{ path: 'hijo', component: PageComponent, title: 'Hijo', data: { description: 'Ruta anidada' } }]
          },
          { path: 'no-encontrada', component: PageComponent, title: '404', data: { noindex: true } }
        ])
      ]
    });
    service = TestBed.inject(SeoService);
    meta = TestBed.inject(Meta);
    doc = TestBed.inject(DOCUMENT);
  });

  afterEach(() => canonical()?.remove());

  describe('apply', () => {
    beforeEach(() => TestBed.inject(Title).setTitle('Blog | Con Atletas Sur'));

    it('con dominio: Open Graph completo, Twitter Card, canonical e indexable', () => {
      service.apply({ description: 'Noticias' }, '/blog?ref=x#top', 'https://www.ejemplo.pe');

      expect(content('name="description"')).toBe('Noticias');
      expect(content('name="robots"')).toBe('index, follow');
      expect(content('property="og:title"')).toBe('Blog | Con Atletas Sur');
      expect(content('property="og:description"')).toBe('Noticias');
      expect(content('property="og:locale"')).toBe('es_PE');
      expect(content('property="og:url"')).toBe('https://www.ejemplo.pe/blog');
      expect(content('property="og:image"')).toBe('https://www.ejemplo.pe/assets/og/og-default.jpg');
      expect(content('property="og:image:width"')).toBe('1200');
      expect(content('name="twitter:card"')).toBe('summary_large_image');
      expect(content('name="twitter:image"')).toBe('https://www.ejemplo.pe/assets/og/og-default.jpg');
      expect(canonical()?.href).toBe('https://www.ejemplo.pe/blog');
    });

    it('debe priorizar el título resuelto de la ruta sobre el <title> actual', () => {
      service.apply({}, '/blog', '', 'Título de la ruta');
      expect(content('property="og:title"')).toBe('Título de la ruta');
    });

    it('debe usar la imagen propia de la ruta si se define', () => {
      service.apply({ image: 'assets/og/evento.jpg' }, '/eventos', 'https://www.ejemplo.pe');
      expect(content('property="og:image"')).toBe('https://www.ejemplo.pe/assets/og/evento.jpg');
    });

    it('sin dominio: omite URL, imagen y canonical (Open Graph exige URLs absolutas) y usa la descripción por defecto', () => {
      service.apply({ description: 'x' }, '/blog', 'https://www.ejemplo.pe');
      service.apply({}, '/blog', '');

      expect(content('name="description"')).toBe(DEFAULT_DESCRIPTION);
      expect(meta.getTag('property="og:url"')).toBeNull();
      expect(meta.getTag('property="og:image"')).toBeNull();
      expect(meta.getTag('property="og:image:width"')).toBeNull();
      expect(meta.getTag('name="twitter:image"')).toBeNull();
      expect(canonical()).toBeNull();
    });

    it('las páginas noindex no deben indexarse', () => {
      service.apply({ noindex: true }, '/not-404', '');
      expect(content('name="robots"')).toBe('noindex, follow');
    });

    it('no debe duplicar etiquetas al navegar varias veces', () => {
      service.apply({ description: 'a' }, '/a', 'https://www.ejemplo.pe');
      service.apply({ description: 'b' }, '/b', 'https://www.ejemplo.pe');

      expect(meta.getTags('name="description"')).toHaveSize(1);
      expect(doc.head.querySelectorAll('link[rel="canonical"]')).toHaveSize(1);
      expect(canonical()?.href).toBe('https://www.ejemplo.pe/b');
    });
  });

  describe('init', () => {
    @Component({ template: '' })
    class HostComponent {
      constructor() {
        inject(SeoService).init();
      }
    }

    it('debe aplicar los datos de la ruta (incluso anidada) en cada navegación', async () => {
      TestBed.createComponent(HostComponent);
      const router = TestBed.inject(Router);

      await router.navigateByUrl('/');
      expect(content('name="description"')).toBe('Portada');

      await router.navigateByUrl('/padre/hijo');
      expect(content('name="description"')).toBe('Ruta anidada');
      expect(content('property="og:title"')).toBe('Hijo');

      await router.navigateByUrl('/no-encontrada');
      expect(content('name="robots"')).toBe('noindex, follow');
    });
  });
});
