import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subscribe',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],  // 👈 Agregado FormsModule también
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.css']
})
export class SubscribeComponent {
  subscribeForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.subscribeForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+51\d{9}$/)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.subscribeForm.valid) {
      console.log('Formulario enviado:', this.subscribeForm.value);
    }
  }
  closeModal() {
    const modal = document.getElementById('subscribeModal');
    if (modal) modal.classList.remove('show', 'd-block');
  }

}
