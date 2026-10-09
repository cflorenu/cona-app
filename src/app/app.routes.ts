import { Route, Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { HomeComponent } from './pages/home/home.component';

export interface RouteFeatures {
  eventsPreview: boolean;
}

/** Vista previa de eventos/roster con datos de demostración (solo desarrollo). */
export const eventsPreviewRoute: Route = {
  path: 'eventos',
  title: 'Eventos | Con Atletas Sur',
  loadComponent: () =>
    import('./features/fight-night/events-preview/events-preview.component').then((m) => m.EventsPreviewComponent)
};

const baseRoutes: Routes = [
  { path: '', component: HomeComponent, title: 'Con Atletas Sur | Artes marciales en Villa El Salvador' },
  {
    path: 'blog',
    title: 'Blog | Con Atletas Sur',
    loadComponent: () => import('./pages/blog/blog.component').then((m) => m.BlogComponent)
  },
  {
    path: 'clase-privada',
    title: 'Clase privada | Con Atletas Sur',
    loadComponent: () =>
      import('./pages/clase-privada/clase-privada.component').then((m) => m.ClasePrivadaComponent)
  },
  {
    path: 'biography',
    title: 'Biografía | Con Atletas Sur',
    loadComponent: () => import('./pages/biography/biography.component').then((m) => m.BiographyComponent)
  },
  {
    path: 'student-portal',
    title: 'Portal del alumno | Con Atletas Sur',
    loadComponent: () =>
      import('./pages/student-portal/student-portal.component').then((m) => m.StudentPortalComponent)
  },
  {
    path: 'not-404',
    title: 'Página no encontrada | Con Atletas Sur',
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
