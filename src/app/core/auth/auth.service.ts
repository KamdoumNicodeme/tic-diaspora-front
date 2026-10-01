import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthToken } from '../models/api.models';

const STORAGE_KEY = 'tic-diaspora.auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly tokenState = signal<AuthToken | null>(this.readStoredToken());

  readonly token = computed(() => this.tokenState());
  readonly isAuthenticated = computed(() => !!this.tokenState()?.accessToken);
  readonly isPresident = computed(() => this.tokenState()?.role === 'PRESIDENT');

  login(email: string, password: string): Observable<AuthToken> {
    return this.api.post<AuthToken>('/auth/login', { email, password }).pipe(
      tap((token) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
        this.tokenState.set(token);
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Observable<void> {
    return this.api.post<void>('/auth/change-password', { currentPassword, newPassword, confirmPassword });
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.tokenState.set(null);
    void this.router.navigateByUrl('/login');
  }

  private readStoredToken(): AuthToken | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthToken;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
}
