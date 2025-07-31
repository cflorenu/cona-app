import { Routes } from '@angular/router';
import { LayoutComponent } from './pages/layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { Not404Component } from './pages/not404/not404.component';
import { HomeComponent } from './pages/home/home.component';
import { BlogComponent } from './pages/blog/blog.component';
import { ClasePrivadaComponent } from './pages/clase-privada/clase-privada.component';
import { BiographyComponent } from './pages/biography/biography.component';
import { StudentPortalComponent } from './pages/student-portal/student-portal.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  //{ path: 'login', component: LoginComponent },
  /*{
    path: 'pages',
    component: HomeComponent,
    loadChildren: () =>
      import('./pages/pages.routes').then((x) => x.pagesRoutes),
  },*/
  { path: 'blog', component: BlogComponent },
  { path: 'clase-privada', component: ClasePrivadaComponent },
  { path: 'biography', component: BiographyComponent },
  { path: 'student-portal', component: StudentPortalComponent },

  { path: 'not-404', component: Not404Component },
  //{ path: '**', redirectTo: 'not-404' }
];
