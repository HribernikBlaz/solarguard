import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EMPTY, Subject, catchError, map, switchMap, timer } from 'rxjs';
import { Chart } from '../../components/chart/chart';
import { Overview } from '../../services/dtos/overview';
import { ProductionComparison } from '../../services/dtos/production-comparison';
import { ProductionService } from '../../services/production-service';
import { SolarDataService } from '../../services/solar-data-service';
import { CENA_KWH } from '../../shared/constants/production-rules';
import { Period } from '../../shared/models/period';
import { dayKey, sumByDay } from '../../shared/utils/day';
import { productionSeries } from '../../shared/utils/production-series';

@Component({
  selector: 'app-dashboard-view',
  imports: [FormsModule, DatePipe, DecimalPipe, RouterLink, Chart],
  templateUrl: './dashboard-view.html',
  styleUrl: './dashboard-view.scss',
})
export class DashboardView implements OnInit {
  protected readonly overviews = signal<Overview[]>([]);
  protected readonly selectedId = signal('');
  protected readonly period = signal<Period>('dan');
  protected readonly error = signal('');
  protected readonly cena = CENA_KWH;
  private readonly loaded = signal<{ id: string; data: ProductionComparison } | null>(null);
  private readonly comparisonRequest = new Subject<void>();
  private readonly data = inject(SolarDataService);
  private readonly production = inject(ProductionService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly sel = computed(() => this.overviews().find((o) => o.inst.id === this.selectedId()));

  protected readonly comparison = computed(() => {
    const loaded = this.loaded();
    if (loaded && loaded.id === this.selectedId() && loaded.data.period === this.period()) {
      return loaded.data;
    }

    return null;
  });

  protected readonly current = computed(() => {
    const o = this.sel();
    const t = Math.max(0, ...[...(o?.actual.keys() ?? [])].filter((t) => t <= Date.now()));

    return { kw: o?.actual.get(t) ?? 0, at: t || null };
  });

  protected readonly todayKwh = computed(() => sumByDay(this.sel()?.actual ?? []).get(dayKey(Date.now())) ?? 0);
  protected readonly savings = computed(() => this.todayKwh() * CENA_KWH);

  protected readonly series = computed(() => {
    const comparison = this.comparison();
    if (!comparison) {
      return { labels: [], titles: [], bars: [], line: [] };
    }

    return productionSeries(comparison);
  });

  ngOnInit() {
    this.comparisonRequest
      .pipe(
        switchMap(() => this.loadComparison()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((loaded) => this.loaded.set(loaded));

    timer(0, 30_000)
      .pipe(
        switchMap(() => this.data.overview().pipe(catchError((e) => this.fail(e)))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((os) => {
        this.error.set('');
        this.overviews.set(os);
        if (!os.some((o) => o.inst.id === this.selectedId())) {
          this.selectedId.set(os[0]?.inst.id ?? '');
        }

        this.comparisonRequest.next();
      });
  }

  protected selectSystem(id: string) {
    this.selectedId.set(id);
    this.comparisonRequest.next();
  }

  protected selectPeriod(period: Period) {
    this.period.set(period);
    this.comparisonRequest.next();
  }

  private loadComparison() {
    const id = this.selectedId();
    if (!id) {
      return EMPTY;
    }

    return this.production.get(id, this.period()).pipe(
      map((data) => ({ id, data })),
      catchError((e) => (this.comparison() ? EMPTY : this.fail(e))),
    );
  }

  private fail(e: { status?: number }) {
    this.error.set(`Napaka ${e.status}`);

    return EMPTY;
  }
}
