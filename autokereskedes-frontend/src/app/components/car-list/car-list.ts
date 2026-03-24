import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarService } from '../../services/car';

@Component({
  selector: 'app-car-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './car-list.html',
  styleUrls: ['./car-list.scss']
})
export class CarList implements OnInit {
  cars: any[] = [];
  activeFilter: string = 'all';
  backendUrl = 'http://localhost:5000/uploads/';
  activeImageIndex: { [carId: number]: number } = {};

  constructor(
    private carService: CarService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCars();
  }

  loadCars(purpose?: string): void {
    this.carService.getCars(purpose).subscribe({
      next: (data) => {
        this.cars = data;
        this.cars.forEach(car => this.activeImageIndex[car.id] = 0);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Hiba:', err)
    });
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    if (filter === 'all') {
      this.loadCars();
    } else {
      this.loadCars(filter);
    }
  }

  setActiveImage(carId: number, index: number): void {
    this.activeImageIndex[carId] = index;
  }

  goToDetail(carId: number): void {
    this.router.navigate(['/cars', carId]);
  }

  // --- ÚJ: Státusz fordító és színező ---
  getStatusText(status: string): string {
    const map: any = { 'AVAILABLE': 'Elérhető', 'RESERVED': 'Lefoglalva', 'RENTED': 'Kiadva', 'IN_SERVICE': 'Szervizben', 'SOLD': 'Eladva' };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: any = { 'RESERVED': 'car-badge-reserved', 'RENTED': 'car-badge-rented', 'IN_SERVICE': 'car-badge-service', 'SOLD': 'car-badge-sold' };
    return map[status] || '';
  }
}