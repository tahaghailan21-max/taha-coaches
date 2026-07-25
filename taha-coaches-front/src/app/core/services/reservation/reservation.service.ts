import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateReservationDto, Reservation } from '../../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {

  private readonly base = `${environment.apiUrl}/api/reservations`;

  private _reservations = new BehaviorSubject<Reservation[]>([]);
  readonly reservations$: Observable<Reservation[]> = this._reservations.asObservable();

  constructor(private http: HttpClient) {}

  loadMine(): void {
    this.http.get<Reservation[]>(`${this.base}/me`, { withCredentials: true })
      .subscribe({ next: list => this._reservations.next(list), error: () => this._reservations.next([]) });
  }

  loadPending(): void {
    this.http.get<Reservation[]>(`${this.base}/pending`, { withCredentials: true })
      .subscribe({ next: list => this._reservations.next(list), error: () => this._reservations.next([]) });
  }

  loadAll(): void {
    this.http.get<Reservation[]>(`${this.base}`, { withCredentials: true })
      .subscribe({ next: list => this._reservations.next(list), error: () => this._reservations.next([]) });
  }

  create(dto: CreateReservationDto): Observable<Reservation> {
    return this.http.post<Reservation>(this.base, dto, { withCredentials: true }).pipe(
      tap(created => this._reservations.next([created, ...this._reservations.value]))
    );
  }

  approve(id: string): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.base}/${id}/approve`, {}, { withCredentials: true })
      .pipe(tap(updated => this.replaceInList(updated)));
  }

  decline(id: string): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.base}/${id}/decline`, {}, { withCredentials: true })
      .pipe(tap(updated => this.replaceInList(updated)));
  }

  complete(id: string): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.base}/${id}/complete`, {}, { withCredentials: true })
      .pipe(tap(updated => this.replaceInList(updated)));
  }

  cancel(id: string): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.base}/${id}/cancel`, {}, { withCredentials: true })
      .pipe(tap(updated => this.replaceInList(updated)));
  }

  cancelAdmin(id: string): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.base}/${id}/cancel/admin`, {}, { withCredentials: true })
      .pipe(tap(updated => this.replaceInList(updated)));
  }

  private replaceInList(updated: Reservation): void {
    this._reservations.next(
      this._reservations.value.map(r => r.id === updated.id ? updated : r)
    );
  }
}
