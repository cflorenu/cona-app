import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { FREE_CLASS_WHATSAPP_URL } from '../../shared/data/contact-info';
import { IntentPreloadingStrategy } from '../../shared/performance/intent-preloading.strategy';
import { NAV_LINKS, NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let element: HTMLElement;
  let modalService: jasmine.SpyObj<ModalService>;

  beforeEach(async () => {
    modalService = jasmine.createSpyObj<ModalService>('ModalService', ['openModal']);

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [provideRouter([]), { provide: ModalService, useValue: modalService }]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  const toggler = (): HTMLButtonElement => element.querySelector('.burger')!;
  const menu = (): HTMLElement => element.querySelector('#menu-principal')!;
  const links = (): HTMLAnchorElement[] => Array.from(element.querySelectorAll<HTMLAnchorElement>('.menu__link'));

  describe('estructura', () => {
    it('la marca debe enlazar al inicio con un nombre accesible', () => {
      const brand = element.querySelector<HTMLAnchorElement>('.brand')!;

      expect(brand.getAttribute('href')).toBe('/');
      expect(brand.getAttribute('aria-label')).toBe('Con Atletas Sur, ir al inicio');
      expect(brand.querySelector('img')?.getAttribute('alt')).toBe('');
    });

    it('debe renderizar la navegación principal en español', () => {
      expect(links().map((a) => a.textContent?.trim())).toEqual(['Inicio', 'Clase privada', 'Blog', 'Biografía', 'Alumnos']);
      expect(links().map((a) => a.getAttribute('href'))).toEqual(NAV_LINKS.map((l) => l.path));
    });

    it('"Escríbenos" debe abrir WhatsApp de forma segura', () => {
      const whatsapp = element.querySelector<HTMLAnchorElement>('.pill--secondary')!;

      expect(whatsapp.href).toBe(FREE_CLASS_WHATSAPP_URL);
      expect(whatsapp.target).toBe('_blank');
      expect(whatsapp.rel).toBe('noopener noreferrer');
    });
  });

  it('pasar el ratón por un enlace debe pedir la precarga de su página', () => {
    const request = spyOn(TestBed.inject(IntentPreloadingStrategy), 'request');

    links()[2].dispatchEvent(new MouseEvent('mouseenter'));

    expect(request).toHaveBeenCalledWith('/blog');
  });

  it('"Clase gratis" debe abrir el modal de inscripción y cerrar el menú móvil', () => {
    fixture.componentInstance.toggleMenu();

    element.querySelector<HTMLButtonElement>('.pill--primary')!.click();

    expect(modalService.openModal).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.isMenuOpen()).toBeFalse();
  });

  describe('menú móvil', () => {
    it('debe iniciar cerrado', () => {
      expect(menu().classList).not.toContain('menu--open');
      expect(toggler().getAttribute('aria-expanded')).toBe('false');
      expect(toggler().getAttribute('aria-controls')).toBe('menu-principal');
    });

    it('el botón debe abrir y cerrar el menú actualizando aria-expanded', () => {
      toggler().click();
      fixture.detectChanges();
      expect(menu().classList).toContain('menu--open');
      expect(toggler().getAttribute('aria-expanded')).toBe('true');

      toggler().click();
      fixture.detectChanges();
      expect(menu().classList).not.toContain('menu--open');
      expect(toggler().getAttribute('aria-expanded')).toBe('false');
    });

    it('debe cerrarse al elegir un enlace', () => {
      toggler().click();
      fixture.detectChanges();

      links()[1].click();
      fixture.detectChanges();

      expect(menu().classList).not.toContain('menu--open');
    });

    it('debe cerrarse al pulsar la marca', () => {
      fixture.componentInstance.toggleMenu();

      element.querySelector<HTMLAnchorElement>('.brand')!.click();

      expect(fixture.componentInstance.isMenuOpen()).toBeFalse();
    });
  });
});
