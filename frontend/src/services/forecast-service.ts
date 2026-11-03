import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay, tap } from 'rxjs';
import { Installation } from './dtos/installation';
import { Weather } from './dtos/weather';

const TILT = 30;
const AZIMUTH = 0;

@Injectable({ providedIn: 'root' })
export class ForecastService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, { at: number; ttl: number; obs: Observable<Weather> }>();

  get(i: Installation): Observable<Weather> {
    const hit = this.cache.get(i.id);
    if (hit && Date.now() - hit.at < hit.ttl) {
      return hit.obs;
    }

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${i.latitude}&longitude=${i.longitude}` +
      `&hourly=global_tilted_irradiance,cloud_cover&current=cloud_cover&tilt=${TILT}&azimuth=${AZIMUTH}` +
      `&past_days=8&forecast_days=16&timezone=UTC`;
    const entry = { at: Date.now(), ttl: 900_000 } as { at: number; ttl: number; obs: Observable<Weather> };
    entry.obs = this.http.get<any>(url).pipe(
      map((r): Weather => ({
        interval: r.current.interval,
        hours: r.hourly.time.map((t: string, k: number) => ({
          t: Date.parse(t + 'Z'),
          gti: r.hourly.global_tilted_irradiance[k] ?? 0,
          cloud: r.hourly.cloud_cover[k] ?? 0,
        })),
      })),
      tap({ next: (w) => (entry.ttl = w.interval * 1000), error: () => this.cache.delete(i.id) }),
      shareReplay(1),
    );
    this.cache.set(i.id, entry);

    return entry.obs;
  }
}
