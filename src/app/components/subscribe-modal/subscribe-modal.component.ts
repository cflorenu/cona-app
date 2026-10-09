import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactService, SubmissionStatus } from '../../services/contact.service';
import { ModalService } from '../../services/modal.service';
import { AnalyticsService, TrackDirective } from '../../shared/analytics/analytics.service';
import { FREE_CLASS_WHATSAPP_URL } from '../../shared/data/contact-info';
import { DISCIPLINES } from '../../shared/data/disciplines';

export const COUNTRY_CODE = '+51';
/** Celular peruano: 9 dígitos empezando por 9 (el +51 se añade al enviar). */
export const PERU_MOBILE_PATTERN = /^9\d{8}$/;

@Component({
  selector: 'app-subscribe-modal',
  imports: [ReactiveFormsModule, RouterLink, TrackDirective],
  templateUrl: './subscribe-modal.component.html',
  styleUrl: './subscribe-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscribeModalComponent {
  private readonly modalService = inject(ModalService);
  private readonly contactService = inject(ContactService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly analytics = inject(AnalyticsService);
  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');

  readonly countryCode = COUNTRY_CODE;
  readonly disciplines = DISCIPLINES.map((d) => d.name);
  readonly whatsappUrl = FREE_CLASS_WHATSAPP_URL;
  readonly isOpen = toSignal(this.modalService.modalState$, { initialValue: false });
  readonly status = signal<SubmissionStatus>('idle');
  readonly isSubmitting = computed(() => this.status() === 'submitting');

  readonly form = inject(NonNullableFormBuilder).group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    telefono: ['', [Validators.required, Validators.pattern(PERU_MOBILE_PATTERN)]],
    _replyto: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    disciplina: ['', Validators.required],
    _gotcha: ['']
  });

  constructor() {
    // Accesibilidad: al abrirse, el foco pasa al primer campo del formulario.
    effect(() => {
      const input = this.nameInput();
      if (input) {
        input.nativeElement.focus();
      }
    });
  }

  isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.status.set('submitting');
    this.contactService
      .requestFreeClass({ ...value, telefono: `${COUNTRY_CODE}${value.telefono}` })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.status.set('success');
          this.analytics.track('Solicitud clase gratis', { disciplina: value.disciplina });
          this.form.reset();
        },
        error: () => this.status.set('error')
      });
  }

  close(): void {
    this.modalService.closeModal();
    if (!this.isSubmitting()) {
      this.status.set('idle');
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }
}
