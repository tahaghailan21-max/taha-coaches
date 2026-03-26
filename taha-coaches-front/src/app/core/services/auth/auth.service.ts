import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, firstValueFrom } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  async loginWithProvider(provider: string): Promise<User> {
    return new Promise((resolve, reject) => {

      const width = 500;
      const height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;

      const listener = (event: MessageEvent) => {
        if (event.origin !== this.apiUrl) return;

        const user = event.data as User;
        window.removeEventListener('message', listener);

        if (user) {
          this.currentUserSubject.next(user); // Update current user state
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

      if (!popup) reject('Popup blocked');
    });
  }

  getCurrentUser(): Promise<User | null> {
    return firstValueFrom(
      this.http.get<User>(`${this.apiUrl}/api/user/me`, {
        withCredentials: true
      })
    )
      .then(user => {
        this.currentUserSubject.next(user); // ✅ THIS IS THE KEY
        return user;
      })
      .catch(() => {
        this.currentUserSubject.next(null);
        return null;
      });
  }

  logout(): Observable<void> {
    this.currentUserSubject.next(null);
    return this.http.post<void>(
      `${this.apiUrl}/api/logout`,
      {},
      { withCredentials: true } // ⭐ VERY IMPORTANT
    );
  }



}
