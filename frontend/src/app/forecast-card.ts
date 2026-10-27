import { DecimalPipe, formatDate } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ChartComponent } from './chart';
import { Overview } from './data';
import { CENA_KWH, GOOD_DAY, WEAK_DAY, dayKey, sumByDay } from './rules';

@Component({
  selector: 'app-forecast-card',
  imports: [DecimalPipe, ChartComponent],
  template: `
    <section class="card">
      <div class="card-head">
        <h2>{{ o().inst.name }}</h2>
        <span class="muted">{{ o().inst.address }} · {{ o().inst.ratedPowerKw }} kW · {{ o().inst.latitude }}, {{ o().inst.longitude }}</span>
      </div>
      @if (rows().length) {
        <app-chart [labels]="labels()" [bars]="bars()" [line]="baseline()" barsLabel="Pričakovana proizvodnja" lineLabel="Povprečje zadnjih 7 dni" />
        <table>
          <thead>
            <tr><th>Dan</th><th>Pričakovano (kWh)</th><th>Oblačnost 9–15 h</th><th>Ocena</th><th>Prihranek (€)</th></tr>
          </thead>
          <tbody>
            @for (r of rows(); track r.key) {
              <tr>
                <td>{{ r.label }}</td>
                <td>{{ r.kwh | number: '1.1-1' }}</td>
                <td>{{ r.cloud === null ? '–' : (r.cloud | number: '1.0-0') + ' %' }}</td>
                <td><span class="badge" [attr.data-grade]="r.tone">{{ r.grade }}</span></td>
                <td>{{ r.kwh * cena | number: '1.2-2' }}</td>
              </tr>
            }
          </tbody>
        </table>
      } @else {
        <p class="error">Napoved ni na voljo (Open-Meteo ni odgovoril).</p>
      }
    </section>
  `,
})
export class ForecastCard {
  readonly o = input.required<Overview>();
  readonly days = input(7);
  protected readonly cena = CENA_KWH;

  private readonly model = computed(() => {
    const w = this.o().weather;
    const kwh = sumByDay(this.o().expected);
    const cloud = new Map<string, number[]>();
    for (const h of w?.hours ?? []) {
      if (new Date(h.t).getHours() >= 9 && new Date(h.t).getHours() <= 15) cloud.set(dayKey(h.t), [...(cloud.get(dayKey(h.t)) ?? []), h.cloud]);
    }
    const keys = [...kwh.keys()].sort();
    const i0 = keys.indexOf(dayKey(Date.now()));
    // prvi dan v podatkih je delen, zato je 7 polnih dni pred danes zanesljivo povprečje
    const past = i0 < 0 ? [] : keys.slice(Math.max(0, i0 - 7), i0).map((k) => kwh.get(k)!);
    const avg = past.length ? past.reduce((a, b) => a + b, 0) / past.length : 0;
    const rows = (i0 < 0 ? [] : keys.slice(i0, i0 + this.days())).map((key) => {
      const kw = kwh.get(key)!;
      const c = cloud.get(key);
      const ratio = avg ? kw / avg : 1;
      return {
        key, kwh: kw, cloud: c ? c.reduce((a, b) => a + b, 0) / c.length : null,
        label: formatDate(new Date(key + 'T12:00'), key === dayKey(Date.now()) ? "'Danes' d. M." : 'EEE d. M.', 'sl'),
        grade: ratio < WEAK_DAY ? 'šibek' : ratio > GOOD_DAY ? 'odličen' : 'običajen',
        tone: ratio < WEAK_DAY ? 'weak' : ratio > GOOD_DAY ? 'good' : '',
      };
    });
    return { rows, avg };
  });

  protected readonly rows = computed(() => this.model().rows);
  protected readonly labels = computed(() => this.rows().map((r) => r.label));
  protected readonly bars = computed(() => this.rows().map((r) => r.kwh));
  protected readonly baseline = computed(() => this.rows().map(() => this.model().avg));
}
