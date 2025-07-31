import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './home/home.component';
import { BlogComponent } from './blog/blog.component';
import { ClasePrivadaComponent } from './clase-privada/clase-privada.component';
import { PortalComponent } from './portal/portal.component';
import { StudentPortalComponent } from './student-portal/student-portal.component';
import { SubscribeComponent } from './subscribe/subscribe.component';
import { BiographyComponent } from './biography/biography.component';
import { LoginComponent } from './login/login.component';


export const pagesRoutes: Routes = [
  //{ path: '', component: HomeComponent },
  //{ path: 'admin', component: LayoutComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'clase-privada', component: ClasePrivadaComponent },
  { path: 'portal', component: PortalComponent },
  //{ path: 'student-portal', component: StudentPortalComponent },
  //{ path: 'subscribe', component: SubscribeComponent },
  { path: 'biography', component: BiographyComponent },
  { path: 'login', component: LoginComponent },
  //{ path: 'luchadores', component: WrestlerPublicComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }


];
