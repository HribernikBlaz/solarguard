import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Alarm } from './dtos/alarm';

@Injectable({ providedIn: 'root' })
export class AlarmService {
  private readonly http = inject(HttpClient);

  getAll(installationId?: string): Observable<Alarm[]> {
    const params: Record<string, string> = installationId ? { installationId } : {};

    return this.http.get<Alarm[]>('/api/alarms', { params });
  }
}
