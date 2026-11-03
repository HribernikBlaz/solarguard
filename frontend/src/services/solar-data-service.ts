import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { evaluate } from '../shared/utils/evaluate';
import { expectedKwh } from '../shared/utils/expected-kwh';
import { Device } from './dtos/device';
import { Installation } from './dtos/installation';
import { Measurement } from './dtos/measurement';
import { Overview } from './dtos/overview';
import { Weather } from './dtos/weather';
import { ForecastService } from './forecast-service';

@Injectable({ providedIn: 'root' })
export class SolarDataService {
  private readonly http = inject(HttpClient);
  private readonly forecast = inject(ForecastService);

  overview(): Observable<Overview[]> {
    return forkJoin({
      installations: this.http.get<Installation[]>('/api/installations'),
      devices: this.http.get<Device[]>('/api/devices'),
      measurements: this.http.get<Measurement[]>('/api/measurements'),
    }).pipe(
      switchMap(({ installations, devices, measurements }) =>
        installations.length
          ? forkJoin(installations.map((i) => this.forecast.get(i).pipe(catchError(() => of(null))))).pipe(
            map((weathers) => installations.map((i, k) => build(i, devices, measurements, weathers[k]))),
          )
          : of([]),
      ),
    );
  }
}

function build(inst: Installation, allDevices: Device[], all: Measurement[], weather: Weather | null): Overview {
  const devices = allDevices.filter((d) => d.installationId === inst.id);
  const ids = new Set(devices.map((d) => d.id));
  const panels = new Set(devices.filter((d) => d.type === 'Panel').map((d) => d.id));
  const measurements = all.filter((m) => ids.has(m.deviceId));

  const expected = new Map<number, number>(weather?.hours.map((h) => [h.t, expectedKwh(h.gti, inst.ratedPowerKw)]));
  const actual = new Map<number, number>();
  const last = new Map<string, Measurement>();
  for (const m of measurements) {
    const t = Date.parse(m.timestamp);
    if (panels.has(m.deviceId)) {
      actual.set(t, (actual.get(t) ?? 0) + m.productionKwh);
    }
    if (t <= Date.now() && (!last.has(m.deviceId) || t > Date.parse(last.get(m.deviceId)!.timestamp))) {
      last.set(m.deviceId, m);
    }
  }
  const hasError = [...last.values()].some((m) => m.hasError);

  return { inst, devices, measurements, weather, expected, actual, result: evaluate(expected, actual, Date.now(), hasError) };
}
