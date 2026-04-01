import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, firstValueFrom } from 'rxjs';
import { User } from '../../models/user.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

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
          this.setCurrentUser(user);
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
    if (this.isBrowser) {
      const cached = localStorage.getItem('currentUser');
      if (cached) {
        const user = JSON.parse(cached);
        this.currentUserSubject.next(user);
        return Promise.resolve(user);
      }
    }

    return firstValueFrom(
      this.http.get<User>(`${this.apiUrl}/api/user/me`, { withCredentials: true })
    )
      .then(user => {
        this.setCurrentUser(user);
        return user;
      })
      .catch(() => {
        this.clearCurrentUser();
        return null;
      });
  }

  logout(): Observable<void> {
    this.clearCurrentUser();
    return this.http.post<void>(`${this.apiUrl}/api/logout`, {}, { withCredentials: true });
  }

  private setCurrentUser(user: User) {
    this.currentUserSubject.next(user);
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  private clearCurrentUser() {
    this.currentUserSubject.next(null);
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
  }

}
