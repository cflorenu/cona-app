import { HttpErrorResponse, provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TimeoutError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CONTACT_REQUEST_TIMEOUT_MS,
  ContactMessage,
  ContactService,
  FREE_CLASS_SUBJECT,
  NEWSLETTER_SUBJECT,
  FreeClassRequest
} from './contact.service';

describe('ContactService', () => {
  let service: ContactService;
  let httpMock: HttpTestingController;

  const message: ContactMessage = {
    nombre_completo: 'Ana Pérez',
    _replyto: 'ana@example.com',
    telefono: '987654321',
    codigo_pais: '+51',
    mensaje: 'Quiero información sobre horarios',
    _gotcha: ''
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()]
    });
    service = TestBed.inject(ContactService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe enviar un POST JSON al endpoint configurado y emitir void al completarse', () => {
    const next = jasmine.createSpy('next');
    const complete = jasmine.createSpy('complete');

    service.send(message).subscribe({ next, complete });

    const req = httpMock.expectOne(environment.contactFormEndpoint);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(message);
    expect(req.request.headers.get('Accept')).toBe('application/json');

    req.flush({ ok: true, next: '/thanks' });

    expect(next).toHaveBeenCalledOnceWith(undefined);
    expect(complete).toHaveBeenCalled();
  });

  it('requestFreeClass debe enviar la solicitud con el asunto de clase gratis', () => {
    const request: FreeClassRequest = {
      nombre: 'Ana',
      telefono: '+51987654321',
      _replyto: 'ana@example.com',
      disciplina: 'Sambo',
      _gotcha: ''
    };
    const next = jasmine.createSpy('next');

    service.requestFreeClass(request).subscribe(next);

    const req = httpMock.expectOne(environment.contactFormEndpoint);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ ...request, _subject: FREE_CLASS_SUBJECT });
    req.flush({ ok: true });
    expect(next).toHaveBeenCalledOnceWith(undefined);
  });

  it('subscribeNewsletter debe enviar el correo con el asunto de newsletter y el honeypot', () => {
    service.subscribeNewsletter({ email: 'ana@example.com', _gotcha: '' }).subscribe();

    const req = httpMock.expectOne(environment.contactFormEndpoint);
    expect(req.request.body).toEqual({
      email: 'ana@example.com',
      _replyto: 'ana@example.com',
      _gotcha: '',
      _subject: NEWSLETTER_SUBJECT
    });
    req.flush({ ok: true });
  });

  it('debe propagar errores HTTP (p. ej. 422 de validación de Formspree)', () => {
    let error: HttpErrorResponse | undefined;

    service.send(message).subscribe({ error: (e: HttpErrorResponse) => (error = e) });

    httpMock
      .expectOne(environment.contactFormEndpoint)
      .flush({ errors: [{ message: 'invalid email' }] }, { status: 422, statusText: 'Unprocessable Entity' });

    expect(error?.status).toBe(422);
  });

  it('debe propagar errores de red (status 0)', () => {
    let error: HttpErrorResponse | undefined;

    service.send(message).subscribe({ error: (e: HttpErrorResponse) => (error = e) });

    httpMock.expectOne(environment.contactFormEndpoint).error(new ProgressEvent('network error'));

    expect(error?.status).toBe(0);
  });

  it('debe fallar con TimeoutError si el servidor no responde a tiempo', () => {
    jasmine.clock().install();
    try {
      let error: unknown;

      service.send(message).subscribe({ error: (e) => (error = e) });
      const req = httpMock.expectOne(environment.contactFormEndpoint);

      jasmine.clock().tick(CONTACT_REQUEST_TIMEOUT_MS - 1);
      expect(error).toBeUndefined();

      jasmine.clock().tick(1);
      expect(error).toBeInstanceOf(TimeoutError);
      expect(req.cancelled).toBeTrue();
    } finally {
      jasmine.clock().uninstall();
    }
  });
});
