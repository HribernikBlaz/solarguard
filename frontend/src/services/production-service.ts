import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Period } from '../shared/models/period';
import { ProductionComparison } from './dtos/production-comparison';

@Injectable({ providedIn: 'root' })
export class ProductionService {
  private readonly http = inject(HttpClient);

  get(installationId: string, period: Period): Observable<ProductionComparison> {
    return this.http.get<ProductionComparison>(`/api/installations/${installationId}/production`, { params: { period } });
  }
}
