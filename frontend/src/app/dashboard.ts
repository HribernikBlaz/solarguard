import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EMPTY, catchError, switchMap, timer } from 'rxjs';
import { ChartComponent } from './chart';
import { Overview, SolarData } from './data';
import { CENA_KWH, Period, dayKey, productionSeries, sumByDay } from './rules';

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
            <button type="button" [class.on]="period() === 'mesec'" (click)="period.set('mesec')">Mesec</button>
            <button type="button" [class.on]="period() === 'leto'" (click)="period.set('leto')">Leto</button>
          </div>
        </div>
        <app-chart
          [labels]="series().labels"
          [titles]="series().titles"
          [bars]="series().bars"
          [line]="series().line"
          barsLabel="Dejansko"
          lineLabel="Pričakovano (napoved)"
          emptyText="Ni podatkov za izbrano obdobje"
        />
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
  protected readonly period = signal<Period>('dan');
  protected readonly error = signal('');
  protected readonly cena = CENA_KWH;
  private readonly now = signal(Date.now());
  private readonly data = inject(SolarData);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly sel = computed(() => this.overviews().find((o) => o.inst.id === this.selectedId()));

  // zadnja meritev (kWh na uro = povprečna moč v kW)
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
