import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Savings } from './dtos/savings';

@Injectable({ providedIn: 'root' })
export class SavingsService {
  private readonly http = inject(HttpClient);

  get(installationId: string): Observable<Savings> {
    return this.http.get<Savings>(`/api/installations/${installationId}/savings`);
  }
}
