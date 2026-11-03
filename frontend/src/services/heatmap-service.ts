import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { PR } from '../shared/constants/production-rules';
import { gridPoints } from '../shared/utils/slovenia';
import { Grid } from './dtos/grid';

@Injectable({ providedIn: 'root' })
export class HeatmapService {
  private readonly http = inject(HttpClient);
  private cached?: { at: number; obs: Observable<Grid> };

  get(): Observable<Grid> {
    if (this.cached && Date.now() - this.cached.at < 900_000) {
      return this.cached.obs;
    }

    const points = gridPoints();
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${points.map((p) => p[0])}&longitude=${points.map((p) => p[1])}` +
      `&hourly=global_tilted_irradiance&tilt=30&azimuth=0&past_days=1&forecast_days=3&timezone=UTC`;
    const obs = this.http.get<any[]>(url).pipe(
      map((r): Grid => ({
        points,
        times: r[0].hourly.time.map((t: string) => Date.parse(t + 'Z')),
        kwhPerKwp: r.map((p) => p.hourly.global_tilted_irradiance.map((g: number | null) => (Math.max(0, g ?? 0) / 1000) * PR)),
      })),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.cached = { at: Date.now(), obs };
    obs.subscribe({ error: () => (this.cached = undefined) });

    return obs;
  }
}
