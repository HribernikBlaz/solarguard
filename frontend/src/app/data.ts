import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { Evaluation, evaluate, expectedKwh } from './rules';

export interface Installation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  installationDate: string;
  ratedPowerKw: number;
}
export interface Device {
  id: string;
  installationId: string;
  type: 'Panel' | 'Inverter';
  manufacturer: string;
  model: string;
  serialNumber: string;
  warrantyUntil: string;
}
export interface Measurement {
  id: string;
  deviceId: string;
  timestamp: string;
  productionKwh: number;
  temperature: number;
  hasError: boolean;
}
export interface Weather {
  interval: number; // sekunde, iz odgovora Open-Meteo (current.interval)
  hours: { t: number; gti: number; cloud: number }[];
}
export interface Overview {
  inst: Installation;
  devices: Device[];
  measurements: Measurement[];
  weather: Weather | null;
  expected: Map<number, number>; // kWh na uro po napovedi
  actual: Map<number, number>; // kWh na uro, vsota panelov
  result: Evaluation;
}

const TILT = 30;
const AZIMUTH = 0; // shortcut: privzeta orientacija (jug, 30°), dodaj naklon in azimut v Installation, ko bo čas za senco

@Injectable({ providedIn: 'root' })
export class ForecastService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, { at: number; ttl: number; obs: Observable<Weather> }>();

  get(i: Installation): Observable<Weather> {
    const hit = this.cache.get(i.id);
    if (hit && Date.now() - hit.at < hit.ttl) return hit.obs;

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

@Injectable({ providedIn: 'root' })
export class SolarData {
  private readonly http = inject(HttpClient);
  private readonly forecast = inject(ForecastService);

  // shortcut: API nima filtrov, naložimo vse in filtriramo tu; ob rasti meritev dodaj filter v MeasurementsController
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
  // shortcut: meritve morajo biti poravnane na polno uro (kot seed in prototip), neporavnanih ne primerjamo
  const actual = new Map<number, number>();
  const last = new Map<string, Measurement>();
  for (const m of measurements) {
    const t = Date.parse(m.timestamp);
    if (panels.has(m.deviceId)) actual.set(t, (actual.get(t) ?? 0) + m.productionKwh);
    if (t <= Date.now() && (!last.has(m.deviceId) || t > Date.parse(last.get(m.deviceId)!.timestamp))) last.set(m.deviceId, m);
  }
  const hasError = [...last.values()].some((m) => m.hasError);
  return { inst, devices, measurements, weather, expected, actual, result: evaluate(expected, actual, Date.now(), hasError) };
}
