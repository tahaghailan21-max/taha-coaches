import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Availability, CreateAvailabilityDto } from '../../models/availability.model';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {

  private base = `${environment.apiUrl}/api/availabilities`;

  private _availabilities = new BehaviorSubject<Availability[]>([]);
  readonly availabilities$ = this._availabilities.asObservable();

  constructor(private http: HttpClient) {}

  // ── Read ──────────────────────────────────────────────────────────────────

  /** Monthly view: fetch the full month. */
  loadMonth(year: number, month: number): void {
    this.http
      .get<Availability[]>(`${this.base}/month?year=${year}&month=${month}`, { withCredentials: true })
      .subscribe({
        next: list => this._availabilities.next(list),
        error: () => this._availabilities.next([])
      });
  }

  /**
   * Weekly view: fetch a 7-day range (Mon → Sun).
   * A single /range call handles weeks that span two months cleanly.
   */
  loadWeek(mondayStr: string, sundayStr: string): void {
    this.http
      .get<Availability[]>(`${this.base}/range?start=${mondayStr}&end=${sundayStr}`, { withCredentials: true })
      .subscribe({
        next: list => this._availabilities.next(list),
        error: () => this._availabilities.next([])
      });
  }

  /** Daily view: fetch exactly one date. */
  loadDate(date: string): void {
    this.http
      .get<Availability[]>(`${this.base}?date=${date}`, { withCredentials: true })
      .subscribe({
        next: list => this._availabilities.next(list),
        error: () => this._availabilities.next([])
      });
  }

  // ── Write ─────────────────────────────────────────────────────────────────

  create(dto: CreateAvailabilityDto): Observable<Availability> {
    return this.http.post<Availability>(this.base, dto, { withCredentials: true }).pipe(
      tap(created => this._availabilities.next([...this._availabilities.value, created]))
    );
  }

  toggle(id: string, isActive: boolean): Observable<Availability> {
    return this.http
      .patch<Availability>(`${this.base}/${id}`, { isActive }, { withCredentials: true })
      .pipe(
        tap(updated =>
          this._availabilities.next(
            this._availabilities.value.map(a => a.id === updated.id ? updated : a)
          )
        )
      );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`, { withCredentials: true }).pipe(
      tap(() =>
        this._availabilities.next(
          this._availabilities.value.filter(a => a.id !== id)
        )
      )
    );
  }
}
