import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarService } from '../../services/car'; // Figyelj az útvonalra!

@Component({
  selector: 'app-car-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './car-list.html',
  styleUrls: ['./car-list.scss']
})
export class CarList implements OnInit {
  cars: any[] = [];
  // A backend szervered címe a képek eléréséhez
  backendUrl = 'http://localhost:5000/uploads/';

  constructor(
    private carService: CarService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carService.getCars().subscribe({
      next: (data) => {
        this.cars = data;
        console.log('Autók a listában:', this.cars);
        // Szólunk az Angularnak, hogy megjött az adat, rajzolja újra
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Hiba:', err)
    });
  }
}