import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { CarService } from '../../../services/car';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-car-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './car-form.html',
  styleUrl: './car-form.scss'
})
export class CarForm implements OnInit {
  carForm: FormGroup;
  currentUser: any;
  isEditMode = false;
  carId: number | null = null;
  loading = false;
  pageTitle = 'Új autó felvitele';

  fuelTypes = ['Benzin', 'Dízel', 'Hibrid', 'Elektromos', 'LPG'];
  transmissions = ['Manuális', 'Automata'];
  purposes = [
    { value: 'sale', label: 'Eladó' },
    { value: 'rent', label: 'Bérelhető' }
  ];

  constructor(
    private fb: FormBuilder,
    private carService: CarService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.carForm = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      licensePlate: ['', Validators.required],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(2030)]],
      mileage: [0, [Validators.required, Validators.min(0)]],
      fuelType: [''],
      transmission: [''],
      engineCapacity: [''],
      horsepower: [''],
      color: [''],
      description: [''],
      purpose: ['sale', Validators.required],
      salePrice: [''],
      rentPricePerDay: [''],
      isAvailable: [true]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.carId = Number(id);
      this.pageTitle = 'Autó szerkesztése';
      this.loadCar();
    }
  }

  loadCar(): void {
    this.carService.getCarById(this.carId!).subscribe({
      next: (car) => {
        this.carForm.patchValue({
          brand: car.brand,
          model: car.model,
          licensePlate: car.licensePlate,
          year: car.year,
          mileage: car.mileage,
          fuelType: car.fuelType,
          transmission: car.transmission,
          engineCapacity: car.engineCapacity,
          horsepower: car.horsepower,
          color: car.color,
          description: car.description,
          purpose: car.purpose,
          salePrice: car.salePrice,
          rentPricePerDay: car.rentPricePerDay,
          isAvailable: car.isAvailable
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Hiba!',
          text: 'Az autó adatai nem tölthetők be.',
          confirmButtonColor: '#c9a84c'
        });
        this.router.navigate(['/admin/cars']);
      }
    });
  }

  hasRole(...roles: string[]): boolean {
    return this.authService.hasRole(...roles);
  }

  logout(): void {
    this.authService.logout();
  }

  submit(): void {
    if (this.carForm.invalid) return;
    this.loading = true;

    const formData = this.carForm.value;

    if (this.isEditMode) {
      this.carService.updateCar(this.carId!, formData).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Mentve!',
            text: 'Az autó adatai sikeresen frissítve.',
            confirmButtonColor: '#c9a84c'
          });
          this.router.navigate(['/admin/cars']);
        },
        error: (err) => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Hiba!',
            text: err.error?.message || 'Hiba történt a mentés során.',
            confirmButtonColor: '#c9a84c'
          });
        }
      });
    } else {
      this.carService.createCar(formData).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Létrehozva!',
            text: 'Az autó sikeresen felvitve.',
            confirmButtonColor: '#c9a84c'
          });
          this.router.navigate(['/admin/cars']);
        },
        error: (err) => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Hiba!',
            text: err.error?.message || 'Hiba történt a mentés során.',
            confirmButtonColor: '#c9a84c'
          });
        }
      });
    }
  }
}