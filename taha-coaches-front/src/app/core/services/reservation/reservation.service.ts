import { Injectable } from '@angular/core';
import { Reservation } from '../../models/reservation.model';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private base = `${environment.apiUrl}/api/reservations`;

  constructor(private http: HttpClient) { }

  getAvailableSlots(date: string, durationMinutes: number): Observable<string[]> {
    const params = new HttpParams()
      .set('date', date)
      .set('duration', durationMinutes);
    return this.http.get<string[]>(`${this.base}/available-slots`, { params });
  }

  getReservationsForDay(date: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.base}/day`, {
      params: new HttpParams().set('date', date)
    });
  }

  createReservation(body: {
    date: string;
    time: string;
    durationMinutes: number;
    notes: string;
  }): Observable<Reservation> {
    return this.http.post<Reservation>(this.base, body, { withCredentials: true });
  }

  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.base}/my`, { withCredentials: true });
  }

  cancelReservation(id: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/cancel`, {});
  }


}
