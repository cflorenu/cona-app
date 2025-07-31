import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { FromComponent } from './components/contact-form/from.component';
import { NavbarComponent } from './components/navbar/navbar.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule,NavbarComponent,FooterComponent,FromComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'cona-app';
  isLoginPage = false;
  isLAdminPage = false;
  isContacFormPage = false;

  /*constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.isLoginPage = this.router.url === '/login';
      this.isLAdminPage = this.router.url.startsWith('/admin');
      this.isContacFormPage = this.router.url.startsWith('/luchadores')
    });
  }*/
}
