import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from '../../services/car';

@Component({
  selector: 'app-car-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './car-detail.html',
  styleUrl: './car-detail.scss'
})
export class CarDetail implements OnInit {
  car: any = null;
  activeImageIndex: number = 0;
  backendUrl = 'http://localhost:5000/uploads/';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carService: CarService,
    private cdr: ChangeDetectorRef
  ) {}

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
}