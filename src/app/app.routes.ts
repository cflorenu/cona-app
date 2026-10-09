import { Route, Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { HomeComponent } from './pages/home/home.component';
import { RouteSeo } from './shared/seo/seo.service';

const seo = (data: RouteSeo): RouteSeo => data;

export interface RouteFeatures {
  eventsPreview: boolean;
}

/** Vista previa de eventos/roster con datos de demostración (solo desarrollo). */
export const eventsPreviewRoute: Route = {
  path: 'eventos',
  title: 'Eventos | Con Atletas Sur',
  data: seo({ description: 'Próximos eventos, cartelera y roster de Con Atletas Sur.' }),
  loadComponent: () =>
    import('./features/fight-night/events-preview/events-preview.component').then((m) => m.EventsPreviewComponent)
};

const baseRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Con Atletas Sur | Artes marciales en Villa El Salvador',
    data: seo({
      description:
        'Academia de artes marciales en Villa El Salvador: Jiu Jitsu, Muay Thai, Sambo y Boxeo para niños y jóvenes. ' +
        'Agenda tu clase gratis.'
    })
  },
  {
    path: 'blog',
    title: 'Blog | Con Atletas Sur',
    data: seo({ description: 'Noticias, eventos y logros de los atletas de Con Atletas Sur.' }),
    loadComponent: () => import('./pages/blog/blog.component').then((m) => m.BlogComponent)
  },
  {
    path: 'clase-privada',
    title: 'Clase privada | Con Atletas Sur',
    data: seo({
      description: 'Entrenamiento personalizado 1 a 1 en artes marciales con coaches certificados en Villa El Salvador.'
    }),
    loadComponent: () =>
      import('./pages/clase-privada/clase-privada.component').then((m) => m.ClasePrivadaComponent)
  },
  {
    path: 'biography',
    title: 'Biografía | Con Atletas Sur',
    data: seo({ description: 'La historia y la trayectoria de Con Atletas Sur y de nuestro equipo de luchadores.' }),
    loadComponent: () => import('./pages/biography/biography.component').then((m) => m.BiographyComponent)
  },
  {
    path: 'student-portal',
    title: 'Portal del alumno | Con Atletas Sur',
    data: seo({
      description: 'Horario de clases de lunes a sábado (6:30 a 9:00 p. m.), disciplinas y contacto para alumnos.'
    }),
    loadComponent: () =>
      import('./pages/student-portal/student-portal.component').then((m) => m.StudentPortalComponent)
  },
  {
    path: 'privacidad',
    title: 'Política de privacidad | Con Atletas Sur',
    data: seo({ description: 'Cómo tratamos tus datos personales en Con Atletas Sur, conforme a la Ley N.º 29733.' }),
    loadComponent: () => import('./pages/privacy/privacy.component').then((m) => m.PrivacyComponent)
  },
  {
    path: 'not-404',
    title: 'Página no encontrada | Con Atletas Sur',
    data: seo({ noindex: true }),
    loadComponent: () => import('./pages/not404/not404.component').then((m) => m.Not404Component)
  },
];

const notFoundRoute: Route = { path: '**', redirectTo: 'not-404' };

export const buildRoutes = (features: RouteFeatures): Routes => [
  ...baseRoutes,
  ...(features.eventsPreview ? [eventsPreviewRoute] : []),
  notFoundRoute
];

export const routes = buildRoutes(environment.features);
