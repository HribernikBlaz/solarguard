import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { RegisterData } from './dtos/register-data';
import { Session } from './dtos/session';

const KEY = 'solarguard.session';

function load(): Session | null {
  try {
    const s: Session | null = JSON.parse(localStorage.getItem(KEY) ?? 'null');

    return s && Date.parse(s.expiresAt) > Date.now() ? s : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly session = signal<Session | null>(load());

  login(email: string, password: string): Observable<Session> {
    return this.http
      .post<Session>('/api/auth/login', { email, password })
      .pipe(tap((s) => this.set(s)));
  }

  register(data: RegisterData): Observable<Session> {
    return this.http.post<Session>('/api/auth/register', data).pipe(tap((s) => this.set(s)));
  }

  logout() {
    this.set(null);
  }

  private set(s: Session | null) {
    this.session.set(s);
    try {
      if (s) {
        localStorage.setItem(KEY, JSON.stringify(s));
      } else {
        localStorage.removeItem(KEY);
      }
    } catch {
    }
  }
}
