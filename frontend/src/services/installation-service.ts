import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Installation } from './dtos/installation';

@Injectable({ providedIn: 'root' })
export class InstallationService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Installation[]> {
    return this.http.get<Installation[]>('/api/installations');
  }

  get(id: string): Observable<Installation> {
    return this.http.get<Installation>(`/api/installations/${id}`);
  }
}
