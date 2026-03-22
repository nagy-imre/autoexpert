import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from '../../services/car';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-car-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './car-detail.html',
  styleUrl: './car-detail.scss'
})
export class CarDetail implements OnInit {
  car: any = null;
  activeImageIndex: number = 0;
  backendUrl = 'http://localhost:5000/uploads/';
  salePhone = '+36 30 123 4567';
  rentPhone = '+36 30 987 6543';

  // Bérlős modal
  showRentalModal = false;
  rentalForm: FormGroup;
  rentalSending = false;

  // Eladós modal
  showSaleModal = false;
  saleForm: FormGroup;
  saleSending = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carService: CarService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.rentalForm = this.fb.group({
      customerName: ['', Validators.required],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      message: ['']
    });

    this.saleForm = this.fb.group({
      customerName: ['', Validators.required],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: ['', Validators.required],
      message: ['']
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.carService.getCarById(id).subscribe({
      next: (data) => {
        this.car = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Hiba:', err)
    });
  }

  setActiveImage(index: number): void {
    this.activeImageIndex = index;
  }

  goBack(): void {
    this.router.navigate(['/cars']);
  }

  // Bérlős modal
  openRentalModal(): void {
    this.showRentalModal = true;
    this.rentalForm.reset();
  }

  closeRentalModal(): void {
    this.showRentalModal = false;
  }

  submitRental(): void {
    if (this.rentalForm.invalid) return;
    this.rentalSending = true;
    this.carService.createRental({ ...this.rentalForm.value, CarId: this.car.id }).subscribe({
      next: () => {
        this.rentalSending = false;
        this.closeRentalModal();
        Swal.fire({
          icon: 'success',
          title: 'Sikeresen elküldve!',
          text: 'Érdeklődését sikeresen elküldtük! Hamarosan visszajelzünk.',
          confirmButtonText: 'Rendben',
          confirmButtonColor: '#198754'
        });
        this.rentalForm.reset();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.rentalSending = false;
        Swal.fire({
          icon: 'error',
          title: 'Hiba!',
          text: err.error?.message || 'Hiba történt a küldés során.',
          confirmButtonText: 'Rendben',
          confirmButtonColor: '#198754'
        });
        this.cdr.detectChanges();
      }
    });
  }

  // Eladós modal
  openSaleModal(): void {
    this.showSaleModal = true;
    this.saleForm.reset();
  }

  closeSaleModal(): void {
    this.showSaleModal = false;
  }

  submitSale(): void {
    if (this.saleForm.invalid) return;
    this.saleSending = true;
    this.carService.createInquiry({ ...this.saleForm.value, CarId: this.car.id }).subscribe({
      next: () => {
        this.saleSending = false;
        this.closeSaleModal();
        Swal.fire({
          icon: 'success',
          title: 'Sikeresen elküldve!',
          text: 'Érdeklődését sikeresen elküldtük! Hamarosan visszajelzünk.',
          confirmButtonText: 'Rendben',
          confirmButtonColor: '#0d6efd'
        });
        this.saleForm.reset();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saleSending = false;
        Swal.fire({
          icon: 'error',
          title: 'Hiba!',
          text: err.error?.message || 'Hiba történt a küldés során.',
          confirmButtonText: 'Rendben',
          confirmButtonColor: '#0d6efd'
        });
        this.cdr.detectChanges();
      }
    });
  }
}