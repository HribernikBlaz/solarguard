import { formatDate } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, computed, effect, inject, signal, viewChild } from '@angular/core';
import * as L from 'leaflet';
import { Grid } from '../../services/dtos/grid';
import { HeatmapService } from '../../services/heatmap-service';
import { GRADIENT } from '../../shared/constants/heatmap-colors';
import { STEP_LAT, STEP_LON } from '../../shared/constants/slovenia';
import { color, indexAt } from '../../shared/utils/heatmap';
import { nearestTown } from '../../shared/utils/slovenia';

@Component({
  selector: 'app-heatmap-view',
  templateUrl: './heatmap-view.html',
  styleUrl: './heatmap-view.scss',
})
export class HeatmapView implements AfterViewInit, OnDestroy {
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
    if (!t) {
      return 'Nalagam ...';
    }

    const text = formatDate(t, 'EEEE, d. M. y, HH:mm', 'sl');
    if (this.idx() === this.nowIdx()) {
      return `${text} (zdaj)`;
    }
    if (this.idx() > this.nowIdx()) {
      return `${text} (napoved)`;
    }

    return text;
  });

  protected readonly stats = computed(() => {
    const g = this.grid();
    if (!g) {
      return null;
    }

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
    if (this.playing()) {
      return this.stop();
    }
    if (this.idx() >= this.last()) {
      this.idx.set(0);
    }

    this.playing.set(true);
    this.timer = setInterval(() => (this.idx() >= this.last() ? this.stop() : this.step(1)), 500);
  }

  private stop() {
    clearInterval(this.timer);
    this.playing.set(false);
  }
}
