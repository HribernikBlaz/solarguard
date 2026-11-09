import { DecimalPipe, formatDate } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Overview } from '../../services/dtos/overview';
import { GOOD_DAY, WEAK_DAY } from '../../shared/constants/production-rules';
import { dayKey, sumByDay } from '../../shared/utils/day';
import { Chart } from '../chart/chart';

@Component({
  selector: 'app-forecast-card',
  imports: [DecimalPipe, Chart],
  templateUrl: './forecast-card.html',
})
export class ForecastCard {
  readonly o = input.required<Overview>();
  readonly days = input(7);
  protected readonly price = computed(() => this.o().inst.electricityPrice);

  private readonly model = computed(() => {
    const w = this.o().weather;
    const kwh = sumByDay(this.o().expected);
    const cloud = new Map<string, number[]>();
    for (const h of w?.hours ?? []) {
      if (new Date(h.t).getHours() >= 9 && new Date(h.t).getHours() <= 15) {
        cloud.set(dayKey(h.t), [...(cloud.get(dayKey(h.t)) ?? []), h.cloud]);
      }
    }
    const price = this.price();
    const keys = [...kwh.keys()].sort();
    const i0 = keys.indexOf(dayKey(Date.now()));
    const past = i0 < 0 ? [] : keys.slice(Math.max(0, i0 - 7), i0).map((k) => kwh.get(k)!);
    const avg = past.length ? past.reduce((a, b) => a + b, 0) / past.length : 0;
    const rows = (i0 < 0 ? [] : keys.slice(i0, i0 + this.days())).map((key) => {
      const kw = kwh.get(key)!;
      const c = cloud.get(key);
      const ratio = avg ? kw / avg : 1;

      return {
        key, kwh: kw, saving: price === null ? null : kw * price, cloud: c ? c.reduce((a, b) => a + b, 0) / c.length : null,
        label: formatDate(new Date(key + 'T12:00'), key === dayKey(Date.now()) ? "'Danes' d. M." : 'EEE d. M.', 'sl'),
        ...this.rate(ratio),
      };
    });

    return { rows, avg };
  });

  protected readonly rows = computed(() => this.model().rows);
  protected readonly labels = computed(() => this.rows().map((r) => r.label));
  protected readonly bars = computed(() => this.rows().map((r) => r.kwh));
  protected readonly baseline = computed(() => this.rows().map(() => this.model().avg));

  private rate(ratio: number) {
    if (ratio < WEAK_DAY) {
      return { grade: 'šibek', tone: 'weak' };
    }
    if (ratio > GOOD_DAY) {
      return { grade: 'odličen', tone: 'good' };
    }

    return { grade: 'običajen', tone: '' };
  }
}
