import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private apiUrl = 'http://localhost:5000/api/cars';
  private rentalUrl = 'http://localhost:5000/api/rentals';
  private inquiryUrl = 'http://localhost:5000/api/inquiries';

  constructor(private http: HttpClient) { }

  getCars(purpose?: string): Observable<any[]> {
    const url = purpose ? `${this.apiUrl}?purpose=${purpose}` : this.apiUrl;
    return this.http.get<any[]>(url);
  }

  getCarById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createRental(data: any): Observable<any> {
    return this.http.post<any>(this.rentalUrl, data);
  }

  createInquiry(data: any): Observable<any> {
    return this.http.post<any>(this.inquiryUrl, data);
  }

  deleteCar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
}
  createCar(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
}

  updateCar(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
}
}