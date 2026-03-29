import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RentalService {
  private apiUrl = 'http://localhost:5000/api/rentals';

  constructor(private http: HttpClient) {}

  getRentals(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getRentalById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createRental(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateRentalStatus(id: number, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteRental(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}