import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CarService } from '../../services/car'; // BEIMPORTÁLVA A SZERVIZ
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {
  contactForm: FormGroup;
  isSubmitting = false;

  contactInfo = [
    { label: 'Értékesítés', phone: '+36 30 123 4567', href: 'tel:+36301234567', desc: 'Eladó járművekkel kapcsolatos érdeklődés' },
    { label: 'Bérlés', phone: '+36 30 987 6543', href: 'tel:+36309876543', desc: 'Bérlési ajánlatok és foglalások' }
  ];

  constructor(
    private fb: FormBuilder,
    private carService: CarService // INJEKTÁLVA A SZERVIZ
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      topic: ['sale', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  submitForm(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    // Az adatcsomag összeállítása a backend számára
    const payload = {
      customerName: this.contactForm.value.name,
      customerEmail: this.contactForm.value.email,
      customerPhone: this.contactForm.value.phone,
      topic: this.contactForm.value.topic,
      message: this.contactForm.value.message,
      inquiryType: 'general' // Jelezzük a backendnek, hogy ez általános kapcsolatfelvétel
    };

    // Valódi HTTP hívás a backend felé
    this.carService.createInquiry(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'success',
          title: 'Üzenet elküldve!',
          text: 'Köszönjük megkeresését. Munkatársunk hamarosan felveszi Önnel a kapcsolatot.',
          confirmButtonColor: '#c9a84c',
          confirmButtonText: 'Rendben'
        });
        this.contactForm.reset({ topic: 'sale' });
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Hiba!',
          text: err.error?.message || 'Hiba történt a küldés során. Kérjük, próbálja újra.',
          confirmButtonColor: '#e05a5a',
          confirmButtonText: 'Rendben'
        });
      }
    });
  }
}