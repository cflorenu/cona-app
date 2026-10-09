import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { TrackDirective } from '../../shared/analytics/analytics.service';
import { FREE_CLASS_WHATSAPP_URL } from '../../shared/data/contact-info';
import { IconComponent } from '../../shared/icon/icon.component';
import { OPTIMIZED_IMAGE } from '../../shared/images/explicit-sizes.directive';
import { PrefetchDirective } from '../../shared/performance/intent-preloading.strategy';

export interface NavLink {
  path: string;
  label: string;
  exact?: boolean;
}

export const NAV_LINKS: readonly NavLink[] = [
  { path: '/', label: 'Inicio', exact: true },
  { path: '/clase-privada', label: 'Clase privada' },
  { path: '/blog', label: 'Blog' },
  { path: '/biography', label: 'Biografía' },
  { path: '/student-portal', label: 'Alumnos' }
];

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, PrefetchDirective, IconComponent, OPTIMIZED_IMAGE, TrackDirective],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private readonly modalService = inject(ModalService);

  readonly links = NAV_LINKS;
  readonly whatsappUrl = FREE_CLASS_WHATSAPP_URL;
  /** Estado del menú desplegable en móvil. */
  readonly isMenuOpen = signal(false);

  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  openFreeClass(): void {
    this.closeMenu();
    this.modalService.openModal();
  }
}
