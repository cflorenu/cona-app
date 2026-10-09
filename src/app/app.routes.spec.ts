import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { buildRoutes, eventsPreviewRoute, routes } from './app.routes';
import { EventsPreviewComponent } from './features/fight-night/events-preview/events-preview.component';
import { BiographyComponent } from './pages/biography/biography.component';
import { BlogComponent } from './pages/blog/blog.component';
import { ClasePrivadaComponent } from './pages/clase-privada/clase-privada.component';
import { HomeComponent } from './pages/home/home.component';
import { Not404Component } from './pages/not404/not404.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { StudentPortalComponent } from './pages/student-portal/student-portal.component';

describe('app routes', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(withXhr()), provideHttpClientTesting()]
    });
    harness = await RouterTestingHarness.create();
  });

  const cases: [string, Type<unknown>][] = [
    ['/', HomeComponent],
    ['/blog', BlogComponent],
    ['/clase-privada', ClasePrivadaComponent],
    ['/biography', BiographyComponent],
    ['/student-portal', StudentPortalComponent],
    ['/privacidad', PrivacyComponent],
    ['/not-404', Not404Component]
  ];

  cases.forEach(([url, component]) =>
    it(`"${url}" debe resolver ${component.name}`, async () => {
      const instance = await harness.navigateByUrl(url);
      expect(instance).toBeInstanceOf(component);
    })
  );

  it('una ruta desconocida debe redirigir a /not-404', async () => {
    const instance = await harness.navigateByUrl('/ruta/que/no/existe');

    expect(instance).toBeInstanceOf(Not404Component);
    expect(TestBed.inject(Router).url).toBe('/not-404');
  });

  describe('buildRoutes (feature flags)', () => {
    it('sin el flag, /eventos no existe (producción)', () => {
      expect(buildRoutes({ eventsPreview: false }).some((r) => r.path === 'eventos')).toBeFalse();
      expect(routes.some((r) => r.path === 'eventos')).toBeFalse();
    });

    it('con el flag, /eventos se registra antes de la ruta comodín', () => {
      const paths = buildRoutes({ eventsPreview: true }).map((r) => r.path);

      expect(paths).toContain('eventos');
      expect(paths[paths.length - 1]).toBe('**');
    });

    it('la ruta /eventos debe cargar la vista previa de forma diferida', async () => {
      const component = await eventsPreviewRoute.loadComponent!();
      expect(component).toBe(EventsPreviewComponent);
    });
  });

  it('todas las rutas salvo Home deben cargarse de forma diferida (lazy loading)', () => {
    const eager = routes.filter((r) => r.component);
    expect(eager.map((r) => r.path)).toEqual(['']);
  });
});
