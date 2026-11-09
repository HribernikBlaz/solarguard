import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Forecast } from './dtos/forecast';

export const FORECAST_DAYS = 14;

@Injectable({ providedIn: 'root' })
export class ForecastService {
  private readonly http = inject(HttpClient);

  get(installationId: string, days = FORECAST_DAYS): Observable<Forecast> {
    return this.http.get<Forecast>(`/api/installations/${installationId}/forecast`, { params: { days } });
  }
}
