import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { CarService } from '../../../services/car';
// Importáljuk a kiszervezett oldalsávot (az útvonalat igazítsd, ha máshol van!)
import { AdminSidebar } from '../admin-sidebar/admin-sidebar'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink], // <-- Ide is bekerült
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  currentUser: any;
  carCount = 0;
  saleCount = 0;
  rentCount = 0;

  constructor(
    private authService: AuthService,
    private carService: CarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.carService.getCars().subscribe({
      next: (cars) => {
        this.carCount = cars.length;
        this.saleCount = cars.filter(c => c.purpose === 'sale').length;
        this.rentCount = cars.filter(c => c.purpose === 'rent').length;
      }
    });
  }

  hasRole(...roles: string[]): boolean {
    return this.authService.hasRole(...roles);
  }
}