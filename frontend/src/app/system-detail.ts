import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlarmList } from './alarm-list';
import { Overview, SolarData } from './data';
import { ForecastCard } from './forecast-card';
import { Placeholder } from './placeholder';

const TABS = [
  ['naprave', 'Naprave'],
  ['meritve', 'Meritve'],
  ['napoved', 'Napoved'],
  ['alarmi', 'Alarmi'],
  ['nalogi', 'Servisni nalogi'],
] as const;

@Component({
  selector: 'app-system-detail',
  imports: [DatePipe, DecimalPipe, FormsModule, RouterLink, AlarmList, ForecastCard, Placeholder],
  template: `
    @if (error()) {
      <p class="error">{{ error() }}</p>
    }
    @if (o(); as o) {
      <div class="page-head">
        <div>
          <h1>{{ o.inst.name }} - {{ o.inst.address }}</h1>
          <p class="muted">
            Nazivna moč: {{ o.inst.ratedPowerKw | number: '1.1-1' }} kW | Nameščen: {{ o.inst.installationDate | date: 'dd.MM.yyyy' }} |
            <span class="badge" [attr.data-status]="o.result.status">{{ o.result.status }}</span>
          </p>
        </div>
      </div>

      <div class="tabs">
        @for (t of tabs; track t[0]) {
          <button type="button" [class.on]="tab() === t[0]" (click)="tab.set(t[0])">{{ t[1] }}</button>
        }
      </div>

      @switch (tab()) {
        @case ('naprave') {
          <table>
            <thead>
              <tr><th>Tip</th><th>Proizvajalec</th><th>Model</th><th>Serijska št.</th><th>Garancija do</th></tr>
            </thead>
            <tbody>
              @for (d of o.devices; track d.id) {
                <tr>
                  <td>{{ d.type }}</td><td>{{ d.manufacturer }}</td><td>{{ d.model }}</td><td>{{ d.serialNumber }}</td>
                  <td>{{ d.warrantyUntil | date: 'dd.MM.yyyy' }}</td>
                </tr>
              } @empty {
                <tr><td colspan="5">Ni naprav.</td></tr>
              }
            </tbody>
          </table>
          <p><a class="btn" routerLink="/naprave">+ Dodaj napravo</a></p>
        }
        @case ('meritve') {
          <table>
            <thead>
              <tr><th>Čas</th><th>Naprava</th><th>Proizvodnja (kWh)</th><th>Temperatura (°C)</th><th>Napaka</th></tr>
            </thead>
            <tbody>
              @for (m of latest(); track m.id) {
                <tr>
                  <td>{{ m.timestamp | date: 'dd.MM.yyyy HH:mm' }}</td>
                  <td>{{ deviceName(m.deviceId) }}</td>
                  <td>{{ m.productionKwh | number: '1.2-2' }}</td>
                  <td>{{ m.temperature | number: '1.1-1' }}</td>
                  <td>{{ m.hasError ? 'Da' : 'Ne' }}</td>
                </tr>
              } @empty {
                <tr><td colspan="5">Ni meritev.</td></tr>
              }
            </tbody>
          </table>
        }
        @case ('napoved') {
          <p>
            <label>Število dni
              <select [ngModel]="days()" (ngModelChange)="days.set($event)">
                @for (n of [3, 5, 7, 14]; track n) {
                  <option [ngValue]="n">{{ n }}</option>
                }
              </select>
            </label>
          </p>
          <app-forecast-card [o]="o" [days]="days()" />
        }
        @case ('alarmi') {
          <app-alarm-list [installationId]="id()" />
        }
        @case ('nalogi') {
          <app-placeholder title="Servisni nalogi" text="Servisni nalogi še niso implementirani (v bazi ni tabele). Ob kritičnem alarmu bo tu ustvarjen nalog." />
        }
      }
    }
  `,
})
export class SystemDetail implements OnInit {
  readonly id = input.required<string>();
  protected readonly tabs = TABS;
  protected readonly tab = signal<(typeof TABS)[number][0]>('naprave');
  protected readonly days = signal(7);
  protected readonly o = signal<Overview | null>(null);
  protected readonly error = signal('');
  private readonly data = inject(SolarData);

  protected readonly latest = computed(() => [...(this.o()?.measurements ?? [])].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, 24));

  protected deviceName(id: string) {
    const d = this.o()?.devices.find((d) => d.id === id);
    return d ? `${d.type} ${d.serialNumber}` : id;
  }

  ngOnInit() {
    this.data.overview().subscribe({
      next: (os) => {
        this.o.set(os.find((o) => o.inst.id === this.id()) ?? null);
        if (!this.o()) this.error.set('Sistem ne obstaja.');
      },
      error: (e) => this.error.set(`Napaka ${e.status}`),
    });
  }
}
