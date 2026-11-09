import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { alarmStatus } from '../shared/utils/alarm-status';
import { expectedKwh } from '../shared/utils/expected-kwh';
import { Alarm } from './dtos/alarm';
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

  // Z installationId se vreme prebere samo za ta sistem.
  overview(installationId?: string): Observable<Overview[]> {
    return forkJoin({
      installations: this.http.get<Installation[]>('/api/installations'),
      devices: this.http.get<Device[]>('/api/devices'),
      measurements: this.http.get<Measurement[]>('/api/measurements'),
      alarms: this.http.get<Alarm[]>('/api/alarms'),
    }).pipe(
      switchMap(({ installations, devices, measurements, alarms }) => {
        const selected = installationId ? installations.filter((i) => i.id === installationId) : installations;
        if (!selected.length) {
          return of([]);
        }

        return forkJoin(selected.map((i) => this.forecast.get(i).pipe(catchError(() => of(null))))).pipe(
          map((weathers) => selected.map((i, k) => build(i, devices, measurements, alarms, weathers[k]))),
        );
      }),
    );
  }
}

function build(inst: Installation, allDevices: Device[], all: Measurement[], allAlarms: Alarm[], weather: Weather | null): Overview {
  const devices = allDevices.filter((d) => d.installationId === inst.id);
  const ids = new Set(devices.map((d) => d.id));
  const panels = new Set(devices.filter((d) => d.type === 'Panel').map((d) => d.id));
  const measurements = all.filter((m) => ids.has(m.deviceId));

  const expected = new Map<number, number>(weather?.hours.map((h) => [h.t, expectedKwh(h.gti, inst.ratedPowerKw)]));
  const actual = new Map<number, number>();
  for (const m of measurements) {
    const t = Date.parse(m.timestamp);
    if (panels.has(m.deviceId)) {
      actual.set(t, (actual.get(t) ?? 0) + m.productionKwh);
    }
  }
  const alarms = allAlarms.filter((a) => a.installationId === inst.id);

  return { inst, devices, measurements, weather, expected, actual, result: alarmStatus(alarms) };
}
