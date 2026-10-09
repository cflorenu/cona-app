import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ContactService } from '../../services/contact.service';
import { ModalService } from '../../services/modal.service';
import { AnalyticsService, TrackDirective } from '../../shared/analytics/analytics.service';
import { SECONDARY_WHATSAPP_NUMBER, STUDENT_HELP_WHATSAPP_URL, WHATSAPP_NUMBER } from '../../shared/data/contact-info';
import { DISCIPLINES } from '../../shared/data/disciplines';
import { IconComponent, IconName } from '../../shared/icon/icon.component';

export interface FooterLink {
  label: string;
  path: string;
  fragment?: string;
}

export interface FooterColumn {
  title: string;
  links: readonly FooterLink[];
}

export interface SocialLink {
  label: string;
  icon: IconName;
  url: string;
}

export type NewsletterStatus = 'idle' | 'invalid' | 'submitting' | 'success' | 'error';

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: 'La academia',
    links: [
      { label: 'Inicio', path: '/' },
      { label: 'Clase privada', path: '/clase-privada' },
      { label: 'Biografía', path: '/biography' },
      { label: 'Blog', path: '/blog' }
    ]
  },
  {
    title: 'Disciplinas',
    links: DISCIPLINES.map((d) => ({ label: d.name, path: '/', fragment: d.slug }))
  },
  {
    title: 'Alumnos',
    links: [
      { label: 'Portal del alumno', path: '/student-portal' },
      { label: 'Horario de clases', path: '/student-portal', fragment: 'horario' }
    ]
  }
];

export const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: 'Facebook', icon: 'facebook', url: 'https://www.facebook.com/paulsobradonunta/' },
  { label: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/paul_sobrado/' },
  { label: 'TikTok', icon: 'tiktok', url: 'https://www.tiktok.com/@paulsobrado?lang=es' },
  { label: 'LinkedIn', icon: 'linkedin', url: 'https://www.linkedin.com/in/paul-antonio-sobrado-nunta-1771bb38/' },
  { label: 'WhatsApp', icon: 'whatsapp', url: `https://wa.me/${WHATSAPP_NUMBER}` }
];

export const MAPS_DIRECTIONS_URL = 'https://www.google.com/maps/dir/?api=1&destination=-12.2134%2C-76.9365';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconComponent, TrackDirective],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  private readonly contactService = inject(ContactService);
  private readonly modalService = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly analytics = inject(AnalyticsService);

  readonly currentYear = new Date().getFullYear();
  readonly columns = FOOTER_COLUMNS;
  readonly socials = SOCIAL_LINKS;
  readonly mapsUrl = MAPS_DIRECTIONS_URL;
  readonly whatsappUrl = STUDENT_HELP_WHATSAPP_URL;
  readonly secondaryWhatsappUrl = `https://wa.me/${SECONDARY_WHATSAPP_NUMBER}`;
  readonly newsletterStatus = signal<NewsletterStatus>('idle');

  /** Sin @angular/forms (el footer está en todas las páginas): validación nativa del navegador. */
  subscribe(event: Event, email: HTMLInputElement, gotcha: HTMLInputElement): void {
    event.preventDefault();
    if (this.newsletterStatus() === 'submitting') {
      return;
    }
    if (!email.checkValidity()) {
      this.newsletterStatus.set('invalid');
      email.focus();
      return;
    }

    this.newsletterStatus.set('submitting');
    this.contactService
      .subscribeNewsletter({ email: email.value.trim(), _gotcha: gotcha.value })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.newsletterStatus.set('success');
          this.analytics.track('Newsletter');
          email.value = '';
        },
        error: () => this.newsletterStatus.set('error')
      });
  }

  openFreeClass(): void {
    this.modalService.openModal();
  }
}
