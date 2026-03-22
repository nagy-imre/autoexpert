import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarService } from '../../services/car';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, OnDestroy {
  featuredCars: any[] = [];
  backendUrl = 'http://localhost:5000/uploads/';
  private sub: any;

  constructor(
    private carService: CarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sub = this.carService.getCars().subscribe({
      next: (data) => {
        this.featuredCars = data.slice(0, 3);
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }
}