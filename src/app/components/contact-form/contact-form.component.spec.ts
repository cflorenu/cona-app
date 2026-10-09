import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ContactService } from '../../services/contact.service';
import { ContactFormComponent, DEFAULT_COUNTRY_CODE, PHONE_PATTERN } from './contact-form.component';

describe('ContactFormComponent', () => {
  let fixture: ComponentFixture<ContactFormComponent>;
  let component: ContactFormComponent;
  let element: HTMLElement;
  let contactService: jasmine.SpyObj<ContactService>;
  let response$: Subject<void>;

  const validValues = {
    nombre_completo: 'Ana Pérez',
    _replyto: 'ana@example.com',
    telefono: '987 654 321',
    mensaje: 'Quiero información sobre horarios',
    _gotcha: ''
  };

  const fillValidForm = (): void => component.form.setValue(validValues);
  const submitButton = (): HTMLButtonElement => element.querySelector('button[type="submit"]')!;
  const submitViaDom = (): void => {
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    response$ = new Subject<void>();
    contactService = jasmine.createSpyObj<ContactService>('ContactService', ['send']);
    contactService.send.and.returnValue(response$.asObservable());

    await TestBed.configureTestingModule({
      imports: [ContactFormComponent],
      providers: [{ provide: ContactService, useValue: contactService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactFormComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  describe('estado inicial', () => {
    it('debe crearse en estado idle con el formulario vacío e inválido', () => {
      expect(component.status()).toBe('idle');
      expect(component.isSubmitting()).toBeFalse();
      expect(component.form.invalid).toBeTrue();
      expect(submitButton().textContent?.trim()).toBe('Enviar');
      expect(element.querySelector('.alert')).toBeNull();
    });

    it('debe mostrar el código de país por defecto en un campo de solo lectura', () => {
      const input = element.querySelector<HTMLInputElement>('#country-code')!;
      expect(input.value).toBe(DEFAULT_COUNTRY_CODE);
      expect(input.readOnly).toBeTrue();
    });

  });

  describe('validaciones', () => {
    it('el nombre es obligatorio y limitado a 100 caracteres', () => {
      const control = component.form.controls.nombre_completo;
      expect(control.hasError('required')).toBeTrue();
      control.setValue('a'.repeat(101));
      expect(control.hasError('maxlength')).toBeTrue();
      control.setValue('Ana');
      expect(control.valid).toBeTrue();
    });

    it('el email es obligatorio y debe tener formato válido', () => {
      const control = component.form.controls._replyto;
      expect(control.hasError('required')).toBeTrue();
      control.setValue('no-es-un-email');
      expect(control.hasError('email')).toBeTrue();
      control.setValue('ana@example.com');
      expect(control.valid).toBeTrue();
    });

    it('el teléfono es opcional', () => {
      expect(component.form.controls.telefono.valid).toBeTrue();
    });

    const validPhones = ['987654321', '987 654 321', '987-654-321', '4567890'];
    const invalidPhones = ['123', 'abc123456', '<script>', '+51987654321', '9876543210123456', '987654321-'];

    validPhones.forEach((phone) =>
      it(`debe aceptar el teléfono "${phone}"`, () => {
        expect(PHONE_PATTERN.test(phone)).toBeTrue();
      })
    );

    invalidPhones.forEach((phone) =>
      it(`debe rechazar el teléfono "${phone}"`, () => {
        component.form.controls.telefono.setValue(phone);
        expect(component.form.controls.telefono.hasError('pattern')).toBeTrue();
      })
    );

    it('el mensaje es obligatorio y limitado a 2000 caracteres', () => {
      const control = component.form.controls.mensaje;
      expect(control.hasError('required')).toBeTrue();
      control.setValue('x'.repeat(2001));
      expect(control.hasError('maxlength')).toBeTrue();
    });
  });

  describe('isInvalid', () => {
    it('debe devolver false si el control es inválido pero no ha sido tocado ni modificado', () => {
      expect(component.isInvalid('nombre_completo')).toBeFalse();
    });

    it('debe devolver true si el control es inválido y fue tocado', () => {
      component.form.controls.nombre_completo.markAsTouched();
      expect(component.isInvalid('nombre_completo')).toBeTrue();
    });

    it('debe devolver true si el control es inválido y fue modificado', () => {
      component.form.controls._replyto.markAsDirty();
      expect(component.isInvalid('_replyto')).toBeTrue();
    });

    it('debe devolver false si el control es válido aunque haya sido tocado', () => {
      component.form.controls.nombre_completo.setValue('Ana');
      component.form.controls.nombre_completo.markAsTouched();
      expect(component.isInvalid('nombre_completo')).toBeFalse();
    });

    it('debe mostrar el mensaje de error y la clase is-invalid en el DOM', () => {
      component.form.controls.mensaje.markAsTouched();
      fixture.detectChanges();

      expect(element.querySelector('#message')!.classList).toContain('is-invalid');
      expect(element.querySelector('#message-error')?.textContent).toContain('Escribe tu mensaje');
    });
  });

  describe('submit', () => {
    it('con formulario inválido no debe llamar al servicio y debe marcar todos los campos como tocados', () => {
      submitViaDom();

      expect(contactService.send).not.toHaveBeenCalled();
      expect(component.status()).toBe('idle');
      expect(component.form.controls.nombre_completo.touched).toBeTrue();
      expect(component.form.controls._replyto.touched).toBeTrue();
      expect(component.form.controls.mensaje.touched).toBeTrue();
      expect(element.querySelectorAll('.invalid-feedback')).toHaveSize(3);
    });

    it('con formulario válido debe enviar el payload con el código de país y pasar a submitting', () => {
      fillValidForm();
      submitViaDom();

      expect(contactService.send).toHaveBeenCalledOnceWith({ ...validValues, codigo_pais: DEFAULT_COUNTRY_CODE });
      expect(component.status()).toBe('submitting');
      expect(submitButton().disabled).toBeTrue();
      expect(submitButton().textContent?.trim()).toBe('Enviando...');
    });

    it('debe ignorar envíos repetidos mientras hay uno en curso (doble clic)', () => {
      fillValidForm();
      component.submit();
      component.submit();

      expect(contactService.send).toHaveBeenCalledTimes(1);
    });

    it('al responder con éxito debe mostrar el mensaje de éxito y resetear el formulario', () => {
      fillValidForm();
      component.submit();

      response$.next();
      response$.complete();
      fixture.detectChanges();

      expect(component.status()).toBe('success');
      expect(component.form.getRawValue()).toEqual({
        nombre_completo: '',
        _replyto: '',
        telefono: '',
        mensaje: '',
        _gotcha: ''
      });
      expect(component.form.pristine).toBeTrue();
      expect(submitButton().disabled).toBeFalse();
      expect(element.querySelector('.alert-success')?.textContent).toContain('Mensaje enviado con éxito');
      expect(element.querySelector('.alert-danger')).toBeNull();
    });

    it('al fallar debe mostrar el mensaje de error y conservar los datos para reintentar', () => {
      fillValidForm();
      component.submit();

      response$.error(new Error('500'));
      fixture.detectChanges();

      expect(component.status()).toBe('error');
      expect(component.form.getRawValue()).toEqual(validValues);
      expect(submitButton().disabled).toBeFalse();
      expect(element.querySelector('.alert-danger')?.getAttribute('role')).toBe('alert');
      expect(element.querySelector('.alert-success')).toBeNull();
    });

    it('debe permitir reintentar tras un error', () => {
      fillValidForm();
      component.submit();
      response$.error(new Error('500'));

      response$ = new Subject<void>();
      contactService.send.and.returnValue(response$.asObservable());
      component.submit();
      response$.next();

      expect(contactService.send).toHaveBeenCalledTimes(2);
      expect(component.status()).toBe('success');
    });

    it('debe incluir el honeypot _gotcha en el payload para que Formspree descarte bots', () => {
      component.form.setValue({ ...validValues, _gotcha: 'soy-un-bot' });
      component.submit();

      expect(contactService.send.calls.mostRecent().args[0]._gotcha).toBe('soy-un-bot');
    });

    it('debe cancelar la suscripción si el componente se destruye antes de la respuesta', () => {
      fillValidForm();
      component.submit();
      expect(response$.observed).toBeTrue();

      fixture.destroy();

      expect(response$.observed).toBeFalse();
    });
  });
});
