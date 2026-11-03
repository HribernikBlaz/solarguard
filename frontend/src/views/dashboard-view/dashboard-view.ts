import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EMPTY, catchError, switchMap, timer } from 'rxjs';
import { Chart } from '../../components/chart/chart';
import { Overview } from '../../services/dtos/overview';
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
  private readonly now = signal(Date.now());
  private readonly data = inject(SolarDataService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly sel = computed(() => this.overviews().find((o) => o.inst.id === this.selectedId()));

  protected readonly current = computed(() => {
    const o = this.sel();
    const t = Math.max(0, ...[...(o?.actual.keys() ?? [])].filter((t) => t <= Date.now()));

    return { kw: o?.actual.get(t) ?? 0, at: t || null };
  });

  protected readonly todayKwh = computed(() => sumByDay(this.sel()?.actual ?? []).get(dayKey(Date.now())) ?? 0);
  protected readonly savings = computed(() => this.todayKwh() * CENA_KWH);

  protected readonly series = computed(() => {
    const o = this.sel();
    if (!o) {
      return { labels: [], titles: [], bars: [], line: [] };
    }

    return productionSeries(this.period(), this.now(), o.actual, o.expected);
  });

  ngOnInit() {
    timer(0, 30_000)
      .pipe(
        switchMap(() => this.data.overview().pipe(catchError((e) => this.fail(e)))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((os) => {
        this.error.set('');
        this.now.set(Date.now());
        this.overviews.set(os);
        if (!os.some((o) => o.inst.id === this.selectedId())) {
          this.selectedId.set(os[0]?.inst.id ?? '');
        }
      });
  }

  private fail(e: { status?: number }) {
    this.error.set(`Napaka ${e.status}`);

    return EMPTY;
  }
}
