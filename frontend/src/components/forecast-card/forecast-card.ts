import { DatePipe, DecimalPipe, formatDate } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, distinctUntilChanged, interval, map, startWith, switchMap, tap } from 'rxjs';
import { Forecast } from '../../services/dtos/forecast';
import { Installation } from '../../services/dtos/installation';
import { ForecastService } from '../../services/forecast-service';
import { FORECAST_GRADES } from '../../shared/constants/forecast-grades';
import { Chart } from '../chart/chart';

const REFRESH_MS = 900_000;

@Component({
  selector: 'app-forecast-card',
  imports: [DatePipe, DecimalPipe, Chart],
  templateUrl: './forecast-card.html',
})
export class ForecastCard {
  readonly installation = input.required<Installation>();
  readonly days = input(7);
  protected readonly failed = signal(false);
  protected readonly outdated = signal(false);
  private readonly loaded = signal<{ id: string; data: Forecast; updatedAt: Date } | null>(null);
  private readonly service = inject(ForecastService);

  protected readonly current = computed(() => {
    const loaded = this.loaded();

    return loaded && loaded.id === this.installation().id ? loaded : null;
  });
  protected readonly price = computed(() => this.installation().electricityPrice);
  protected readonly rows = computed(() => {
    const price = this.price();

    return (this.current()?.data.days ?? []).slice(0, this.days()).map((d, index) => ({
      key: d.date,
      kwh: d.expectedKwh,
      cloud: d.cloudPercent,
      saving: price === null ? null : d.expectedKwh * price,
      label: formatDate(new Date(d.date + 'T12:00'), index === 0 ? "'Danes' d. M." : 'EEE d. M.', 'sl'),
      grade: FORECAST_GRADES[d.grade],
    }));
  });
  protected readonly labels = computed(() => this.rows().map((r) => r.label));
  protected readonly bars = computed(() => this.rows().map((r) => r.kwh));
  protected readonly baseline = computed(() => this.rows().map(() => this.current()?.data.baselineKwh ?? 0));

  constructor() {
    toObservable(this.installation)
      .pipe(
        map((installation) => installation.id),
        distinctUntilChanged(),
        tap(() => {
          this.failed.set(false);
          this.outdated.set(false);
        }),
        switchMap((id) => interval(REFRESH_MS).pipe(startWith(0), switchMap(() => this.load(id)))),
        takeUntilDestroyed(),
      )
      .subscribe((loaded) => this.apply(loaded));
  }

  // Osvežitev, ki prinese samo sporočilo o nedostopnem vremenu, ne izbriše napovedi, ki jo že imamo.
  private apply(next: { id: string; data: Forecast; updatedAt: Date }) {
    const previous = this.current();
    if (next.data.warning && previous && previous.data.days.length > 0) {
      this.outdated.set(true);

      return;
    }

    this.loaded.set(next);
    this.outdated.set(false);
    this.failed.set(false);
  }

  private load(id: string) {
    return this.service.get(id).pipe(
      map((data) => ({ id, data, updatedAt: new Date() })),
      catchError(() => {
        this.failed.set(true);

        return EMPTY;
      }),
    );
  }
}
