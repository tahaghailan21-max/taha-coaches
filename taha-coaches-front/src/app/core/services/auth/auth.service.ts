import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {User} from "../../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getGoogleLoginUrl(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.apiUrl}/api/oauth2/authorize/google`);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/api/user/me`);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/api/logout`, {});
  }
}
