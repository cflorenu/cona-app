import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-from',
  templateUrl: './from.component.html',
  styleUrls: ['./from.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]

})
export class FromComponent {

  codigoPaisPredeterminado = '+51';

  isSubmitting = false;
  submissionStatus: 'success' | 'error' | null = null;

  async submitForm(contactForm: NgForm) {
    if (contactForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.submissionStatus = null;

    const formspreeUrl = 'https://formspree.io/f/xrblljgn';

    const formObject = contactForm.value;

    try {
      const response = await fetch(formspreeUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formObject)
      });

      if (response.ok) {
        this.submissionStatus = 'success';
        contactForm.resetForm();
      } else {
        this.submissionStatus = 'error';
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      this.submissionStatus = 'error';
    } finally {
      this.isSubmitting = false;
    }
  }
}
