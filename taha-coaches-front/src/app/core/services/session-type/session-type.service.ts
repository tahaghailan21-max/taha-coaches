import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionType } from '../../models/session-type.model';

@Injectable({ providedIn: 'root' })
export class SessionTypeService {

  private readonly base = `${environment.apiUrl}/api/public/session-types`;

  private _types = new BehaviorSubject<SessionType[]>([]);
  readonly types$ = this._types.asObservable();

  constructor(private http: HttpClient) {}

  load(): void {
    this.http.get<SessionType[]>(this.base).subscribe({
      next:  types => this._types.next(types),
      error: ()    => this._types.next([])
    });
  }

  get snapshot(): SessionType[] { return this._types.value; }
}
