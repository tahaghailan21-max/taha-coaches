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

  loginWithProvider(provider: string): Promise<User> {
    return new Promise((resolve, reject) => {

      const width = 500;
      const height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;

      const listener = (event: MessageEvent) => {
        // 🔐 IMPORTANT: security check
        if (event.origin !== this.apiUrl) {
          return;
        }

        const user = event.data as User;

        window.removeEventListener('message', listener);

        if (user) {
          resolve(user);
        } else {
          reject('No user returned');
        }
      };

      window.addEventListener('message', listener);

      const popup = window.open(
        `${this.apiUrl}/oauth2/authorization/${provider}`,
        `${provider}-login`,
        `width=${width},height=${height},top=${top},left=${left}`
      );

      if (!popup) {
        reject('Popup blocked');
      }
    });
  }

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
