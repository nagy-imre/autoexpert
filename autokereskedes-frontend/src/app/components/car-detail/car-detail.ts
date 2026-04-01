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

  showImageModal = false;

  showRentalModal = false;
  rentalForm: FormGroup;
  rentalSending = false;

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
    this.cdr.detectChanges();
  }

  openImageModal(): void {
    if (this.car && this.car.images && this.car.images.length > 0) {
      this.showImageModal = true;
      document.body.style.overflow = 'hidden';
      this.cdr.detectChanges();
    }
  }

  closeImageModal(): void {
    this.showImageModal = false;
    document.body.style.overflow = 'auto';
    this.cdr.detectChanges();
  }

  nextImage(event: Event): void {
    event.stopPropagation();
    if (this.car.images && this.car.images.length > 0) {
      this.activeImageIndex = (this.activeImageIndex + 1) % this.car.images.length;
      this.cdr.detectChanges();
    }
  }

  prevImage(event: Event): void {
    event.stopPropagation();
    if (this.car.images && this.car.images.length > 0) {
      this.activeImageIndex = (this.activeImageIndex - 1 + this.car.images.length) % this.car.images.length;
      this.cdr.detectChanges();
    }
  }

  goBack(): void {
    this.router.navigate(['/cars']);
  }

  // --- FORMÁZÓ ÉS FORDÍTÓ FÜGGVÉNYEK ---
  getStatusText(status: string): string {
    const map: any = { 'AVAILABLE': 'Elérhető', 'RESERVED': 'Lefoglalva', 'RENTED': 'Kiadva', 'IN_SERVICE': 'Felkészítés alatt', 'SOLD': 'Eladva' };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: any = { 'AVAILABLE': 'detail-badge-available', 'RESERVED': 'detail-badge-reserved', 'RENTED': 'detail-badge-rented', 'IN_SERVICE': 'detail-badge-service', 'SOLD': 'detail-badge-sold' };
    return map[status] || '';
  }

  getCondition(condition: string): string {
    const map: any = { 'new': 'Új', 'excellent': 'Kiváló', 'normal': 'Normál', 'damaged': 'Sérült' };
    return condition ? (map[condition] || condition) : '-';
  }

  getServiceBook(book: string): string {
    const map: any = { 'full_dealer': 'Végig márkaszervizben vezetett', 'partial': 'Részleges', 'none': 'Nincs' };
    return book ? (map[book] || book) : '-';
  }

  getFuelText(val: string): string {
    const map: any = { petrol: 'Benzin', gasoline: 'Benzin', diesel: 'Dízel', electric: 'Elektromos', hybrid: 'Hibrid', lpg: 'LPG' };
    return val ? (map[val] || val) : '-';
  }

  getTransmissionText(val: string): string {
    const map: any = { manual: 'Manuális', automatic: 'Automata' };
    return val ? (map[val] || val) : '-';
  }

  getDriveText(val: string): string {
    const map: any = { FWD: 'Első kerék', RWD: 'Hátsó kerék', AWD: 'Összkerék', '4WD': 'Összkerék' };
    return val ? (map[val] || val) : '-';
  }

  getBodyText(val: string): string {
    const map: any = { sedan: 'Sedan', suv: 'SUV', kombi: 'Kombi', hatchback: 'Ferdehátú', coupe: 'Kupé', cabrio: 'Kabrió', van: 'Furgon', pickup: 'Pickup' };
    return val ? (map[val] || val) : '-';
  }

  getBoolText(val: any): string {
    if (val === true) return 'Igen';
    if (val === false) return 'Nem';
    return '-';
  }

  // --- BÉRLŐS MODAL ---
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

    const payload = {
      ...this.rentalForm.value,
      CarId: this.car.id,
      inquiryType: 'rent'
    };

    this.carService.createInquiry(payload).subscribe({
      next: () => {
        this.rentalSending = false;
        this.closeRentalModal();
        Swal.fire({ icon: 'success', title: 'Sikeresen elküldve!', text: 'Bérlési érdeklődését megkaptuk! Hamarosan visszajelzünk.', confirmButtonText: 'Rendben', confirmButtonColor: '#c9a84c' });
        this.rentalForm.reset();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.rentalSending = false;
        Swal.fire({ icon: 'error', title: 'Hiba!', text: err.error?.message || 'Hiba történt a küldés során.', confirmButtonText: 'Rendben', confirmButtonColor: '#e05a5a' });
        this.cdr.detectChanges();
      }
    });
  }

  // --- ELADÓS MODAL ---
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

    const payload = {
      ...this.saleForm.value,
      CarId: this.car.id,
      inquiryType: 'sale'
    };

    this.carService.createInquiry(payload).subscribe({
      next: () => {
        this.saleSending = false;
        this.closeSaleModal();
        Swal.fire({ icon: 'success', title: 'Sikeresen elküldve!', text: 'Vásárlási érdeklődését megkaptuk! Hamarosan visszajelzünk.', confirmButtonText: 'Rendben', confirmButtonColor: '#c9a84c' });
        this.saleForm.reset();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saleSending = false;
        Swal.fire({ icon: 'error', title: 'Hiba!', text: err.error?.message || 'Hiba történt a küldés során.', confirmButtonText: 'Rendben', confirmButtonColor: '#e05a5a' });
        this.cdr.detectChanges();
      }
    });
  }
}