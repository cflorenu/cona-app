import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService, SubmissionStatus } from '../../services/contact.service';

export const DEFAULT_COUNTRY_CODE = '+51';
/** 7 a 15 caracteres: dígitos, espacios o guiones; debe empezar y terminar en dígito. */
export const PHONE_PATTERN = /^\d[\d\s-]{5,13}\d$/;

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactFormComponent {
  private readonly contactService = inject(ContactService);
  private readonly destroyRef = inject(DestroyRef);

  readonly countryCode = DEFAULT_COUNTRY_CODE;
  readonly status = signal<SubmissionStatus>('idle');
  readonly isSubmitting = computed(() => this.status() === 'submitting');

  readonly form = inject(NonNullableFormBuilder).group({
    nombre_completo: ['', [Validators.required, Validators.maxLength(100)]],
    _replyto: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    telefono: ['', [Validators.pattern(PHONE_PATTERN)]],
    mensaje: ['', [Validators.required, Validators.maxLength(2000)]],
    _gotcha: ['']
  });

  isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  submit(): void {
    if (this.isSubmitting()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.status.set('submitting');
    this.contactService
      .send({ ...this.form.getRawValue(), codigo_pais: this.countryCode })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.status.set('success');
          this.form.reset();
        },
        error: () => this.status.set('error')
      });
  }
}
