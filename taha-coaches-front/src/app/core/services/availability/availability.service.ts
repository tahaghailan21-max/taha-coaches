import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateAvailabilityDto, Availability } from '../../models/availability.model';


@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {

  private base = `${environment.apiUrl}/api/availabilities`;

  constructor(private http: HttpClient) { }

  getForDate(date: string): Observable<Availability[]> {
    return this.http.get<Availability[]>(`${this.base}?date=${date}`);
  }

  create(dto: CreateAvailabilityDto): Observable<Availability> {
    return this.http.post<Availability>(this.base, dto);
  }

  toggle(id: string, isActive: boolean): Observable<Availability> {
    return this.http.patch<Availability>(`${this.base}/${id}`, { isActive });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
