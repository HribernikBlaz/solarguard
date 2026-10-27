import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Injectable, OnDestroy, computed, effect, inject, signal, viewChild } from '@angular/core';
import { formatDate } from '@angular/common';
import * as L from 'leaflet';
import { Observable, map, shareReplay } from 'rxjs';
import { PR } from './rules';
import { STEP_LAT, STEP_LON, gridPoints, nearestTown } from './slovenia';

interface Grid {
  points: [number, number][];
  times: number[]; // konec ure, UTC ms
  kwhPerKwp: number[][]; // [točka][ura], kWh na 1 kWp
}

const STOPS: [number, string][] = [[0, '#3b4a8a'], [0.25, '#2f9fb0'], [0.5, '#f2d64b'], [0.75, '#f08a24'], [1, '#c6372c']];
const GRADIENT = `linear-gradient(to right, ${STOPS.map(([p, c]) => `${c} ${p * 100}%`).join(', ')})`;
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));

const indexAt = (times: number[], now: number) => Math.max(0, times.filter((t) => t <= now).length - 1);

function color(v: number, max: number): string {
  const p = Math.min(1, Math.max(0, v / max));
  const k = Math.max(1, STOPS.findIndex(([s]) => s >= p));
  const [p0, c0] = STOPS[k - 1];
  const [p1, c1] = STOPS[k];
  const t = (p - p0) / (p1 - p0);
  return `rgb(${hex(c0).map((a, i) => Math.round(a + (hex(c1)[i] - a) * t)).join(',')})`;
}

@Injectable({ providedIn: 'root' })
export class HeatmapService {
  private readonly http = inject(HttpClient);
  private cached?: { at: number; obs: Observable<Grid> };

  // en klic za vse točke (Open-Meteo podpira sezname koordinat); osvežitev na 15 min kot pri napovedi sistemov
  get(): Observable<Grid> {
    if (this.cached && Date.now() - this.cached.at < 900_000) return this.cached.obs;
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

@Component({
  selector: 'app-heatmap-page',
  template: `
    <div class="page-head">
      <h1>Toplotna karta proizvodnje</h1>
      <span class="muted">Pričakovana proizvodnja na 1 kWp (naklon 30°, jug)</span>
    </div>
    @if (error()) {
      <p class="error">{{ error() }}</p>
    }
    <div #map class="map"></div>
    <p class="legend scale">
      <span>0</span><i class="ramp" [style.background]="gradient"></i><span>{{ max().toFixed(2) }} kWh/kWp</span>
    </p>

    <section class="card timebar">
      <div class="card-head">
        <h2>{{ label() }}</h2>
        <div class="seg">
          <button type="button" (click)="step(-24)" [disabled]="!ready()">−1 dan</button>
          <button type="button" (click)="step(-1)" [disabled]="!ready()">◀ ura</button>
          <button type="button" (click)="toggle()" [disabled]="!ready()">{{ playing() ? '⏸ Pavza' : '▶ Predvajaj' }}</button>
          <button type="button" (click)="step(1)" [disabled]="!ready()">ura ▶</button>
          <button type="button" (click)="step(24)" [disabled]="!ready()">+1 dan</button>
          <button type="button" (click)="idx.set(nowIdx())" [disabled]="!ready()">Zdaj</button>
        </div>
      </div>
      <input type="range" min="0" [max]="last()" [value]="idx()" (input)="idx.set(+$any($event.target).value)" [disabled]="!ready()" aria-label="Ura" />
      @if (stats(); as s) {
        <p class="stats">
          Največ: <strong>{{ s.max.toFixed(2) }} kWh/kWp</strong> pri kraju {{ s.where }} ·
          povprečje Slovenije: <strong>{{ s.mean.toFixed(2) }} kWh/kWp</strong>
          @if (s.mean < 0.01) {
            · (ponoči ni proizvodnje)
          }
        </p>
      }
    </section>
  `,
})
export class HeatmapPage implements AfterViewInit, OnDestroy {
  protected readonly gradient = GRADIENT;
  protected readonly error = signal('');
  protected readonly grid = signal<Grid | null>(null);
  protected readonly idx = signal(0);
  protected readonly playing = signal(false);
  protected readonly ready = computed(() => !!this.grid());
  protected readonly last = computed(() => (this.grid()?.times.length ?? 1) - 1);
  protected readonly max = computed(() => Math.max(0.01, ...(this.grid()?.kwhPerKwp.flat() ?? [])));
  protected readonly nowIdx = computed(() => indexAt(this.grid()?.times ?? [], Date.now()));

  protected readonly label = computed(() => {
    const t = this.grid()?.times[this.idx()];
    return t ? formatDate(t, 'EEEE, d. M. y, HH:mm', 'sl') + (this.idx() === this.nowIdx() ? ' (zdaj)' : this.idx() > this.nowIdx() ? ' (napoved)' : '') : 'Nalagam ...';
  });

  protected readonly stats = computed(() => {
    const g = this.grid();
    if (!g) return null;
    const v = g.kwhPerKwp.map((p) => p[this.idx()]);
    const top = v.indexOf(Math.max(...v));
    return { max: v[top], mean: v.reduce((a, b) => a + b, 0) / v.length, where: nearestTown(...g.points[top]) };
  });

  private readonly el = viewChild.required<ElementRef<HTMLElement>>('map');
  private readonly service = inject(HeatmapService);
  private cells: L.Rectangle[] = [];
  private map?: L.Map;
  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    effect(() => {
      const g = this.grid();
      const i = this.idx();
      const max = this.max();
      this.cells.forEach((c, k) => {
        const v = g!.kwhPerKwp[k][i];
        c.setStyle({ fillColor: color(v, max), fillOpacity: v < 0.005 ? 0 : 0.7 });
      });
    });
  }

  ngAfterViewInit() {
    this.map = L.map(this.el().nativeElement).setView([46.15, 14.99], 8);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    this.service.get().subscribe({
      next: (g) => {
        this.cells = g.points.map(([lat, lon], k) =>
          L.rectangle([[lat - STEP_LAT / 2, lon - STEP_LON / 2], [lat + STEP_LAT / 2, lon + STEP_LON / 2]], { stroke: false, fillOpacity: 0 })
            .bindTooltip(() => `${nearestTown(lat, lon)}: ${this.grid()!.kwhPerKwp[k][this.idx()].toFixed(2)} kWh/kWp`, { sticky: true })
            .addTo(this.map!),
        );
        this.grid.set(g);
        this.idx.set(indexAt(g.times, Date.now()));
      },
      error: (e) => this.error.set(`Napoved ni na voljo (Open-Meteo, napaka ${e.status}).`),
    });
  }

  ngOnDestroy() {
    clearInterval(this.timer);
    this.map?.remove();
  }

  protected step(n: number) {
    this.idx.update((i) => Math.min(this.last(), Math.max(0, i + n)));
  }

  protected toggle() {
    if (this.playing()) return this.stop();
    if (this.idx() >= this.last()) this.idx.set(0);
    this.playing.set(true);
    this.timer = setInterval(() => (this.idx() >= this.last() ? this.stop() : this.step(1)), 500);
  }

  private stop() {
    clearInterval(this.timer);
    this.playing.set(false);
  }
}
