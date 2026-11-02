import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface Session {
  token: string;
  expiresAt: string;
  email: string;
  name: string;
  role: string;
}
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

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
export class Auth {
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
      if (s) localStorage.setItem(KEY, JSON.stringify(s));
      else localStorage.removeItem(KEY);
    } catch {
      // brez localStorage seja velja samo do osvežitve strani
    }
  }
}

export function errorText(e: unknown): string {
  const err = e as HttpErrorResponse;
  if (err.status === 0) return 'Strežnik ni dosegljiv.';
  return err.error?.errors?.join(' ') ?? err.error?.error ?? 'Napaka pri izvedbi.';
}
