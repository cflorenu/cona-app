import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { ContactService } from '../../services/contact.service';
import { ModalService } from '../../services/modal.service';
import { DISCIPLINES } from '../../shared/data/disciplines';
import { FOOTER_COLUMNS, FooterComponent, MAPS_DIRECTIONS_URL, SOCIAL_LINKS } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;
  let component: FooterComponent;
  let element: HTMLElement;
  let contactService: jasmine.SpyObj<ContactService>;
  let modalService: jasmine.SpyObj<ModalService>;
  let response$: Subject<void>;

  beforeEach(async () => {
    response$ = new Subject<void>();
    contactService = jasmine.createSpyObj<ContactService>('ContactService', ['subscribeNewsletter']);
    contactService.subscribeNewsletter.and.returnValue(response$.asObservable());
    modalService = jasmine.createSpyObj<ModalService>('ModalService', ['openModal']);

    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        provideRouter([]),
        { provide: ContactService, useValue: contactService },
        { provide: ModalService, useValue: modalService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  const text = (selector: string): string | undefined => element.querySelector(selector)?.textContent?.trim();
  const email = (): HTMLInputElement => element.querySelector('#newsletter-email')!;
  const submit = (value: string): void => {
    email().value = value;
    element.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
  };

  describe('contacto', () => {
    it('debe ofrecer los dos números oficiales de WhatsApp', () => {
      const second = element.querySelector<HTMLAnchorElement>('a[href="https://wa.me/51935491546"]')!;

      expect(second.textContent?.trim()).toBe('+51 935 491 546');
      expect(second.rel).toBe('noopener noreferrer');
      expect(element.querySelector('a[href="tel:+51946893354"]')).not.toBeNull();
    });

    it('debe mostrar dirección, teléfono y correo enlazables', () => {
      expect(text('.contact__address')).toContain('Villa El Salvador 15834');
      expect(element.querySelector('a[href="tel:+51946893354"]')).not.toBeNull();
      expect(element.querySelector<HTMLAnchorElement>('a[href^="mailto:"]')!.href).toBe('mailto:pasonu60@gmail.com');
    });

    it('"Escríbenos" debe llevar al formulario (#contacto) y "Cómo llegar" abrir Google Maps', () => {
      const links = Array.from(element.querySelectorAll<HTMLAnchorElement>('.contact__links a'));

      expect(links[0].getAttribute('href')).toBe('/#contacto');
      expect(links[1].href).toBe(MAPS_DIRECTIONS_URL);
      expect(links[1].rel).toBe('noopener noreferrer');
    });

    it('ya no debe embeber el mapa (iframe pesado de terceros en todas las páginas)', () => {
      expect(element.querySelector('iframe')).toBeNull();
    });
  });

  describe('columnas de enlaces', () => {
    it('debe mostrar las columnas con sus títulos en español', () => {
      const titles = Array.from(element.querySelectorAll('.footer-col__title')).map((t) => t.textContent);
      expect(titles).toEqual(FOOTER_COLUMNS.map((c) => c.title));
    });

    it('las disciplinas deben enlazar a su sección en Inicio', () => {
      const hrefs = Array.from(element.querySelectorAll<HTMLAnchorElement>('.footer-col:nth-child(2) a')).map((a) =>
        a.getAttribute('href')
      );
      expect(hrefs).toEqual(DISCIPLINES.map((d) => `/#${d.slug}`));
    });

    it('"Horario de clases" debe enlazar al horario del portal del alumno', () => {
      const horario = Array.from(element.querySelectorAll<HTMLAnchorElement>('.footer-col a')).find(
        (a) => a.textContent?.trim() === 'Horario de clases'
      )!;
      expect(horario.getAttribute('href')).toBe('/student-portal#horario');
    });

    it('"Clase gratis" debe abrir el modal de inscripción', () => {
      element.querySelector<HTMLButtonElement>('.footer-col__action')!.click();
      expect(modalService.openModal).toHaveBeenCalledTimes(1);
    });
  });

  describe('newsletter', () => {
    it('con un correo inválido no debe enviar y debe avisar', () => {
      submit('no-es-un-correo');

      expect(contactService.subscribeNewsletter).not.toHaveBeenCalled();
      expect(email().getAttribute('aria-invalid')).toBe('true');
      expect(text('#newsletter-status')).toContain('correo electrónico válido');
      expect(document.activeElement).toBe(email());
    });

    it('vacío también es inválido (campo obligatorio)', () => {
      submit('');
      expect(component.newsletterStatus()).toBe('invalid');
    });

    it('con un correo válido debe suscribir, confirmar y limpiar el campo', () => {
      submit('  ana@example.com ');
      expect(contactService.subscribeNewsletter).toHaveBeenCalledOnceWith({ email: 'ana@example.com', _gotcha: '' });
      expect(element.querySelector<HTMLButtonElement>('.newsletter__submit')!.disabled).toBeTrue();
      expect(text('#newsletter-status')).toBe('Enviando…');

      response$.next();
      fixture.detectChanges();

      expect(text('#newsletter-status')).toContain('¡Listo!');
      expect(email().value).toBe('');
    });

    it('si falla el envío debe mostrar el error y conservar el correo', () => {
      submit('ana@example.com');

      response$.error(new Error('500'));
      fixture.detectChanges();

      expect(text('#newsletter-status')).toContain('No pudimos registrarte');
      expect(email().value).toBe('ana@example.com');
    });

    it('debe ignorar envíos repetidos mientras hay uno en curso', () => {
      submit('ana@example.com');
      submit('ana@example.com');

      expect(contactService.subscribeNewsletter).toHaveBeenCalledTimes(1);
    });

    it('debe enviar el honeypot para que el proveedor descarte bots', () => {
      element.querySelector<HTMLInputElement>('#newsletter-gotcha')!.value = 'bot';
      submit('bot@example.com');

      expect(contactService.subscribeNewsletter.calls.mostRecent().args[0]._gotcha).toBe('bot');
    });

    it('el campo debe tener etiqueta accesible y descripción', () => {
      expect(element.querySelector('label[for="newsletter-email"]')?.textContent).toBe('Correo electrónico');
      expect(email().getAttribute('aria-describedby')).toBe('newsletter-status newsletter-help');
    });
  });

  describe('barra inferior', () => {
    it('debe mostrar el año actual en el copyright', () => {
      expect(text('.footer-bottom__copy')).toContain(`© ${new Date().getFullYear()} Con Atletas Sur`);
    });

    it('las redes sociales deben tener nombre accesible y abrirse de forma segura', () => {
      const socials = Array.from(element.querySelectorAll<HTMLAnchorElement>('.socials__link'));

      expect(socials.map((a) => a.getAttribute('aria-label'))).toEqual(SOCIAL_LINKS.map((s) => s.label));
      socials.forEach((a) => expect(a.rel).withContext(a.href).toBe('noopener noreferrer'));
    });
  });

  it('todos los enlaces externos deben usar rel="noopener noreferrer"', () => {
    element.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]').forEach((a) =>
      expect(a.rel).withContext(a.href).toBe('noopener noreferrer')
    );
  });
});
