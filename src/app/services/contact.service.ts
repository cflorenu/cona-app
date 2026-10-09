import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, timeout } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContactMessage {
  nombre_completo: string;
  _replyto: string;
  telefono: string;
  codigo_pais: string;
  mensaje: string;
  /** Honeypot de Formspree: los bots lo rellenan y Formspree descarta el envío. */
  _gotcha: string;
}

export interface FreeClassRequest {
  nombre: string;
  telefono: string;
  _replyto: string;
  disciplina: string;
  _gotcha: string;
}

export type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export const CONTACT_REQUEST_TIMEOUT_MS = 10_000;
export const FREE_CLASS_SUBJECT = 'Solicitud de clase gratis';
export const NEWSLETTER_SUBJECT = 'Suscripción al newsletter';

export interface NewsletterSignup {
  email: string;
  _gotcha: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = environment.contactFormEndpoint;

  send(message: ContactMessage): Observable<void> {
    return this.post(message);
  }

  /** Solicitud de clase gratis; el asunto permite filtrarla en la bandeja de Formspree. */
  requestFreeClass(request: FreeClassRequest): Observable<void> {
    return this.post({ ...request, _subject: FREE_CLASS_SUBJECT });
  }

  subscribeNewsletter({ email, _gotcha }: NewsletterSignup): Observable<void> {
    return this.post({ email, _replyto: email, _gotcha, _subject: NEWSLETTER_SUBJECT });
  }

  private post(body: object): Observable<void> {
    return this.http
      .post<unknown>(this.endpoint, body, { headers: { Accept: 'application/json' } })
      .pipe(
        timeout(CONTACT_REQUEST_TIMEOUT_MS),
        map(() => undefined)
      );
  }
}
