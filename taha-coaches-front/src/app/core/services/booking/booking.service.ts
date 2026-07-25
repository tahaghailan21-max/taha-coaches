import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TimeRange } from '../../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class BookingService {

  private readonly base = `${environment.apiUrl}/api/public`;

  constructor(private http: HttpClient) {}

  getFreeTimes(date: string, sessionTypeId: string): Observable<TimeRange[]> {
    return this.http.get<TimeRange[]>(
      `${this.base}/free-times?date=${date}&sessionTypeId=${sessionTypeId}`
    );
  }

  getFreeCounts(start: string, end: string, sessionTypeId: string): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(
      `${this.base}/free-times/counts?start=${start}&end=${end}&sessionTypeId=${sessionTypeId}`
    );
  }
}
