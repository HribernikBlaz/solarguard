import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChartComponent } from './chart';
import { Overview, SolarData } from './data';
import { CENA_KWH, HOUR, dayKey, sumByDay } from './rules';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, DatePipe, DecimalPipe, RouterLink, ChartComponent],
  template: `
    <div class="page-head">
      <h1>Pregled</h1>
      <label>
        Sistem
        <select [ngModel]="selectedId()" (ngModelChange)="selectedId.set($event)">
          @for (o of overviews(); track o.inst.id) {
            <option [value]="o.inst.id">{{ o.inst.name }}</option>
          }
        </select>
      </label>
    </div>
    @if (error()) {
      <p class="error">{{ error() }}</p>
    }

    @if (sel(); as o) {
      <section class="kpis">
        <div class="kpi">
          <span>Trenutna proizvodnja</span>
          <strong>{{ current().kw | number: '1.2-2' }} kW</strong>
          <small>{{ current().at ? (current().at | date: 'dd.MM. HH:mm') : 'ni meritev' }}</small>
        </div>
        <div class="kpi">
          <span>Dnevni prihranek</span>
          <strong>{{ savings() | number: '1.2-2' }} €</strong>
          <small>danes {{ todayKwh() | number: '1.1-1' }} kWh po {{ cena | number: '1.2-2' }} €/kWh</small>
        </div>
        <div class="kpi" [class.bad]="o.result.messages.length > 0">
          <span>Aktivni alarmi</span>
          <strong>{{ o.result.messages.length }}</strong>
          <small>{{ o.result.messages[0] ?? 'brez težav' }}</small>
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <h2>Proizvodnja (dejanska vs. pričakovana)</h2>
          <div class="seg">
            <button type="button" [class.on]="period() === 'dan'" (click)="period.set('dan')">Dan</button>
            <button type="button" [class.on]="period() === 'teden'" (click)="period.set('teden')">Teden</button>
            <button type="button" disabled title="Za mesec in leto ni dovolj zgodovine meritev">Mesec</button>
            <button type="button" disabled title="Za mesec in leto ni dovolj zgodovine meritev">Leto</button>
          </div>
        </div>
        <app-chart [labels]="series().labels" [bars]="series().bars" [line]="series().line" barsLabel="Dejansko" lineLabel="Pričakovano (napoved)" />
      </section>
    }

    <h2>Moji sistemi</h2>
    <table>
      <thead>
        <tr><th>Naziv</th><th>Naslov</th><th>Nazivna moč</th><th>Status</th></tr>
      </thead>
      <tbody>
        @for (o of overviews(); track o.inst.id) {
          <tr>
            <td><a [routerLink]="['/sistemi', o.inst.id]">{{ o.inst.name }}</a></td>
            <td>{{ o.inst.address }}</td>
            <td>{{ o.inst.ratedPowerKw | number: '1.1-1' }} kW</td>
            <td><span class="badge" [attr.data-status]="o.result.status">{{ o.result.status }}</span></td>
          </tr>
        } @empty {
          <tr><td colspan="4">Ni sistemov.</td></tr>
        }
      </tbody>
    </table>
  `,
})
export class Dashboard implements OnInit {
  protected readonly overviews = signal<Overview[]>([]);
  protected readonly selectedId = signal('');
  protected readonly period = signal<'dan' | 'teden'>('dan');
  protected readonly error = signal('');
  protected readonly cena = CENA_KWH;
  private readonly data = inject(SolarData);

  protected readonly sel = computed(() => this.overviews().find((o) => o.inst.id === this.selectedId()));

  // zadnja meritev (kWh na uro = povprečna moč v kW)
  protected readonly current = computed(() => {
    const o = this.sel();
    const t = Math.max(0, ...[...(o?.actual.keys() ?? [])].filter((t) => t <= Date.now()));
    return { kw: o?.actual.get(t) ?? 0, at: t || null };
  });

  protected readonly todayKwh = computed(() => sumByDay(this.sel()?.actual ?? []).get(dayKey(Date.now())) ?? 0);
  protected readonly savings = computed(() => this.todayKwh() * CENA_KWH);

  // primerjava samo čez ure, ki imajo meritev, da delni današnji dan ni popačen
  protected readonly series = computed(() => {
    const o = this.sel();
    const times = [...(o?.actual.keys() ?? [])].sort((a, b) => a - b);
    if (!o || !times.length) return { labels: [], bars: [], line: [] };
    if (this.period() === 'dan') {
      const hours = times.filter((t) => t > times.at(-1)! - 24 * HOUR);
      return {
        labels: hours.map((t) => `${new Date(t).getHours()}:00`),
        bars: hours.map((t) => o.actual.get(t)!),
        line: hours.map((t) => o.expected.get(t) ?? 0),
      };
    }
    const actual = sumByDay(o.actual);
    const expected = sumByDay(times.map((t): [number, number] => [t, o.expected.get(t) ?? 0]));
    const days = [...actual.keys()].sort().slice(-7);
    return {
      labels: days.map((d) => `${+d.slice(8)}.${+d.slice(5, 7)}.`),
      bars: days.map((d) => actual.get(d)!),
      line: days.map((d) => expected.get(d) ?? 0),
    };
  });

  ngOnInit() {
    this.data.overview().subscribe({
      next: (os) => {
        this.overviews.set(os);
        this.selectedId.set(os[0]?.inst.id ?? '');
      },
      error: (e) => this.error.set(`Napaka ${e.status}`),
    });
  }
}
