import { ViewportScroller } from '@angular/common';
import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { ContactFormComponent } from './components/contact-form/contact-form.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SubscribeModalComponent } from './components/subscribe-modal/subscribe-modal.component';
import { ModalService } from './services/modal.service';
import { JsonLdService } from './shared/seo/json-ld.service';
import { buildAcademyJsonLd } from './shared/seo/structured-data';

/** Alto del header fijo: las anclas (/#muay-thai, #contacto) no deben quedar tapadas. */
export const HEADER_OFFSET_PX = 88;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ContactFormComponent, SubscribeModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  /** El modal de clase gratis se crea (y su código se descarga) solo cuando se abre por primera vez. */
  readonly isSubscribeOpen = toSignal(inject(ModalService).modalState$, { initialValue: false });

  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  constructor() {
    inject(ViewportScroller).setOffset([0, HEADER_OFFSET_PX]);
    // SEO local: la academia como negocio deportivo en todas las páginas (incluido el HTML prerenderizado).
    inject(JsonLdService).set('organization', buildAcademyJsonLd(environment.siteUrl));
  }

  /** Lleva el foco al contenido principal (saltando la navegación) sin cambiar la URL. */
  skipToContent(event: Event): void {
    event.preventDefault();
    this.main().nativeElement.focus();
  }
}
