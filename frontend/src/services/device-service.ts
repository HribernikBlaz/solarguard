import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceHistoryItem } from './dtos/service-history-item';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private readonly http = inject(HttpClient);

  serviceHistory(deviceId: string, from: string, to: string): Observable<ServiceHistoryItem[]> {
    let params = new HttpParams();
    if (from) {
      params = params.set('from', from);
    }
    if (to) {
      params = params.set('to', to);
    }

    return this.http.get<ServiceHistoryItem[]>(`/api/devices/${deviceId}/service-history`, { params });
  }
}
