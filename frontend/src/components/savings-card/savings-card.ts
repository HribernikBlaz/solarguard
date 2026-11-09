import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { EMPTY, catchError, interval, map, startWith, switchMap, tap } from 'rxjs';
import { Savings } from '../../services/dtos/savings';
import { SavingsService } from '../../services/savings-service';
import { SAVINGS_PERIODS, SavingsPeriod } from '../../shared/constants/savings-periods';

const REFRESH_MS = 30_000;

@Component({
  selector: 'app-savings-card',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './savings-card.html',
})
export class SavingsCard {
  readonly installationId = input<string>();
  protected readonly periods = SAVINGS_PERIODS;
  protected readonly period = signal<SavingsPeriod>('day');
  protected readonly failed = signal(false);
  protected readonly periodTitle = computed(() => this.periods.find((p) => p.key === this.period())?.title);
  private readonly loaded = signal<{ id: string; data: Savings } | null>(null);
  private readonly service = inject(SavingsService);

  protected readonly savings = computed(() => {
    const loaded = this.loaded();

    return loaded && loaded.id === this.installationId() ? loaded.data : null;
  });

  constructor() {
    toObservable(this.installationId)
      .pipe(
        tap(() => this.failed.set(false)),
        switchMap((id) => (id ? interval(REFRESH_MS).pipe(startWith(0), switchMap(() => this.load(id))) : EMPTY)),
        takeUntilDestroyed(),
      )
      .subscribe((loaded) => {
        this.loaded.set(loaded);
        this.failed.set(false);
      });
  }

  private load(id: string) {
    return this.service.get(id).pipe(
      map((data) => ({ id, data })),
      catchError(() => {
        this.failed.set(true);

        return EMPTY;
      }),
    );
  }
}
