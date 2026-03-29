import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { CarService } from '../../../services/car';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-car-manager',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './car-manager.html',
  styleUrl: './car-manager.scss'
})
export class CarManager implements OnInit {
  cars: any[] = [];
  currentUser: any;
  loading = true;

  constructor(
    private carService: CarService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef // <-- Ezzel tudunk szólni az Angularnak, hogy frissítsen
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadCars();
  }

  loadCars(): void {
    this.loading = true;
    this.carService.getCars().subscribe({
      next: (data) => {
        this.cars = data;
        this.loading = false;
        this.cdr.detectChanges(); // <-- Itt frissítjük a képernyőt az adatok megérkezése után!
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  hasRole(...roles: string[]): boolean {
    return this.authService.hasRole(...roles);
  }

  // --- ÚJ: Státusz fordító és színező ---
  getStatusText(status: string): string {
    const map: any = { 'AVAILABLE': 'Elérhető', 'RESERVED': 'Lefoglalva', 'RENTED': 'Kiadva', 'IN_SERVICE': 'Szervizben', 'SOLD': 'Eladva' };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: any = { 'AVAILABLE': 'table-badge-available', 'RESERVED': 'table-badge-reserved', 'RENTED': 'table-badge-rented', 'IN_SERVICE': 'table-badge-service', 'SOLD': 'table-badge-sold' };
    return map[status] || 'table-badge-unavailable';
  }

  editCar(id: number): void {
    this.router.navigate(['/admin/cars/edit', id]);
  }

  deleteCar(id: number, brand: string, model: string): void {
    Swal.fire({
      title: 'Biztosan törli?',
      text: `${brand} ${model} véglegesen törlésre kerül!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e05a5a',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Igen, törlöm!',
      cancelButtonText: 'Mégsem'
    }).then((result) => {
      if (result.isConfirmed) {
        this.carService.deleteCar(id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Törölve!', text: `${brand} ${model} sikeresen törölve.`, confirmButtonColor: '#c9a84c' });
            this.loadCars(); 
          },
          error: () => {
            Swal.fire({ icon: 'error', title: 'Hiba!', text: 'Hiba történt a törlés során.', confirmButtonColor: '#c9a84c' });
          }
        });
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}