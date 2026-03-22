import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private apiUrl = 'http://localhost:5000/api/cars';

  constructor(private http: HttpClient) { }

  getCars(purpose?: string): Observable<any[]> {
    const url = purpose ? `${this.apiUrl}?purpose=${purpose}` : this.apiUrl;
    return this.http.get<any[]>(url);
  }

  getCarById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}