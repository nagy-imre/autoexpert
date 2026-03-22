import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  // A backendünk címe
  private apiUrl = 'http://localhost:5000/api/cars';

  constructor(private http: HttpClient) { }

  // Összes autó lekérése a backendről
  getCars(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}