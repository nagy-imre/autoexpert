import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <-- 1. Behoztuk a ChangeDetectorRef-et
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { CarService } from '../../../services/car';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
    private router: Router,
    private cdr: ChangeDetectorRef // <-- 2. Példányosítottuk
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.carService.getCars().subscribe({
      next: (cars) => {
        this.carCount = cars.length;
        this.saleCount = cars.filter(c => c.purpose === 'sale').length;
        this.rentCount = cars.filter(c => c.purpose === 'rent').length;
        
        // 3. Szólunk az Angularnak, hogy frissítse a képernyőn a számokat!
        this.cdr.detectChanges(); 
      }
    });
  }

  hasRole(...roles: string[]): boolean {
    return this.authService.hasRole(...roles);
  }
}