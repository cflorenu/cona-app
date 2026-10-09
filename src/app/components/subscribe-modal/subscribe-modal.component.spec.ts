import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { ContactService } from '../../services/contact.service';
import { AnalyticsService } from '../../shared/analytics/analytics.service';
import { ModalService } from '../../services/modal.service';
import { FREE_CLASS_WHATSAPP_URL } from '../../shared/data/contact-info';
import { DISCIPLINES } from '../../shared/data/disciplines';
import { COUNTRY_CODE, PERU_MOBILE_PATTERN, SubscribeModalComponent } from './subscribe-modal.component';

describe('SubscribeModalComponent', () => {
  let fixture: ComponentFixture<SubscribeModalComponent>;
  let component: SubscribeModalComponent;
  let element: HTMLElement;
  let modalService: ModalService;
  let contactService: jasmine.SpyObj<ContactService>;
  let response$: Subject<void>;

  const validValues = {
    nombre: 'Ana Pérez',
    telefono: '987654321',
    _replyto: 'ana@example.com',
    disciplina: 'Muay Thai',
    _gotcha: ''
  };

  const modal = (): HTMLElement | null => element.querySelector('.modal');
  const open = (): void => {
    modalService.openModal();
    fixture.detectChanges();
  };
  const submitButton = (): HTMLButtonElement => element.querySelector('button[type="submit"]')!;

  beforeEach(async () => {
    response$ = new Subject<void>();
    contactService = jasmine.createSpyObj<ContactService>('ContactService', ['requestFreeClass']);
    contactService.requestFreeClass.and.returnValue(response$.asObservable());

    await TestBed.configureTestingModule({
      imports: [SubscribeModalComponent],
      providers: [provideRouter([]), { provide: ContactService, useValue: contactService }]
    }).compileComponents();

    modalService = TestBed.inject(ModalService);
    fixture = TestBed.createComponent(SubscribeModalComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  describe('apertura y cierre', () => {
    it('no debe existir en el DOM mientras está cerrado', () => {
      expect(component.isOpen()).toBeFalse();
      expect(modal()).toBeNull();
    });

    it('debe abrirse desde ModalService como diálogo accesible y enfocar el primer campo', () => {
      open();

      expect(modal()!.getAttribute('role')).toBe('dialog');
      expect(modal()!.getAttribute('aria-modal')).toBe('true');
      expect(modal()!.getAttribute('aria-labelledby')).toBe('subscribeModalLabel');
      expect(document.activeElement).toBe(element.querySelector('#subscribe-name'));
    });

    it('debe cerrarse con el botón de cerrar', () => {
      open();
      element.querySelector<HTMLButtonElement>('.btn-close')!.click();
      fixture.detectChanges();

      expect(component.isOpen()).toBeFalse();
      expect(modal()).toBeNull();
    });

    it('debe cerrarse al hacer clic en el fondo, pero no dentro del diálogo', () => {
      open();
      element.querySelector<HTMLElement>('.modal-content')!.click();
      expect(component.isOpen()).toBeTrue();

      modal()!.click();
      expect(component.isOpen()).toBeFalse();
    });

    it('debe cerrarse con Escape (foco dentro o fuera del diálogo)', () => {
      open();
      element
        .querySelector('#subscribe-email')!
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(component.isOpen()).toBeFalse();

      open();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(component.isOpen()).toBeFalse();
    });

    it('Escape con el modal cerrado no debe emitir un cierre innecesario', () => {
      spyOn(modalService, 'closeModal');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(modalService.closeModal).not.toHaveBeenCalled();
    });

    it('debe ofrecer WhatsApp como alternativa segura', () => {
      open();
      const link = element.querySelector<HTMLAnchorElement>('a.btn-outline-success')!;

      expect(link.href).toBe(FREE_CLASS_WHATSAPP_URL);
      expect(link.rel).toBe('noopener noreferrer');
    });
  });

  describe('formulario', () => {
    beforeEach(open);

    it('debe listar todas las disciplinas', () => {
      const options = Array.from(element.querySelectorAll('#subscribe-discipline option:not([disabled])')).map(
        (o) => o.textContent?.trim()
      );
      expect(options).toEqual(DISCIPLINES.map((d) => d.name));
    });

    it('debe enlazar la política de privacidad y cerrar el modal al abrirla', () => {
      const link = element.querySelector<HTMLAnchorElement>('.form-consent a')!;
      expect(link.getAttribute('href')).toBe('/privacidad');

      link.click();

      expect(component.isOpen()).toBeFalse();
    });

    it('debe mostrar el prefijo de país', () => {
      expect(element.querySelector('.input-group-text')?.textContent).toBe(COUNTRY_CODE);
    });

    it('todos los campos visibles son obligatorios', () => {
      const { nombre, telefono, _replyto, disciplina } = component.form.controls;
      [nombre, telefono, _replyto, disciplina].forEach((c) => expect(c.hasError('required')).toBeTrue());
    });

    it('el celular debe tener 9 dígitos y empezar con 9', () => {
      expect(PERU_MOBILE_PATTERN.test('987654321')).toBeTrue();
      ['87654321', '887654321', '9876543210', '+51987654321', '98765432a'].forEach((v) =>
        expect(PERU_MOBILE_PATTERN.test(v)).withContext(v).toBeFalse()
      );
    });

    it('isInvalid solo marca errores tras tocar o modificar el campo', () => {
      expect(component.isInvalid('nombre')).toBeFalse();
      component.form.controls.nombre.markAsTouched();
      expect(component.isInvalid('nombre')).toBeTrue();
      component.form.controls._replyto.markAsDirty();
      expect(component.isInvalid('_replyto')).toBeTrue();
      component.form.controls.nombre.setValue('Ana');
      expect(component.isInvalid('nombre')).toBeFalse();
    });

    it('con datos inválidos no envía y muestra los errores', () => {
      element.querySelector('form')!.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(contactService.requestFreeClass).not.toHaveBeenCalled();
      expect(element.querySelectorAll('.invalid-feedback')).toHaveSize(4);
    });

    it('con datos válidos envía la solicitud con el teléfono en formato internacional', () => {
      component.form.setValue(validValues);
      element.querySelector('form')!.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(contactService.requestFreeClass).toHaveBeenCalledOnceWith({
        ...validValues,
        telefono: '+51987654321'
      });
      expect(submitButton().disabled).toBeTrue();
      expect(submitButton().textContent?.trim()).toBe('Enviando...');
    });

    it('debe ignorar envíos repetidos mientras hay uno en curso', () => {
      component.form.setValue(validValues);
      component.onSubmit();
      component.onSubmit();

      expect(contactService.requestFreeClass).toHaveBeenCalledTimes(1);
    });

    it('al tener éxito muestra la confirmación, resetea el formulario y vuelve al formulario al reabrir', () => {
      const track = spyOn(TestBed.inject(AnalyticsService), 'track');
      component.form.setValue(validValues);
      component.onSubmit();
      response$.next();
      fixture.detectChanges();

      expect(element.querySelector('form')).toBeNull();
      expect(element.textContent).toContain('¡Solicitud enviada!');
      expect(track).toHaveBeenCalledOnceWith('Solicitud clase gratis', { disciplina: 'Muay Thai' });
      expect(component.form.getRawValue().nombre).toBe('');

      element.querySelector<HTMLButtonElement>('.modal-body .btn-warning')!.click();
      fixture.detectChanges();
      expect(component.isOpen()).toBeFalse();
      expect(component.status()).toBe('idle');

      open();
      expect(element.querySelector('form')).not.toBeNull();
    });

    it('al fallar muestra el error y conserva los datos', () => {
      component.form.setValue(validValues);
      component.onSubmit();
      response$.error(new Error('500'));
      fixture.detectChanges();

      expect(component.status()).toBe('error');
      expect(element.querySelector('.alert-danger')?.getAttribute('role')).toBe('alert');
      expect(component.form.getRawValue()).toEqual(validValues);
    });

    it('cerrar durante el envío no debe perder el estado de envío', () => {
      component.form.setValue(validValues);
      component.onSubmit();

      component.close();

      expect(component.status()).toBe('submitting');
    });

    it('debe cancelar la petición si el componente se destruye', () => {
      component.form.setValue(validValues);
      component.onSubmit();
      expect(response$.observed).toBeTrue();

      fixture.destroy();

      expect(response$.observed).toBeFalse();
    });
  });
});
