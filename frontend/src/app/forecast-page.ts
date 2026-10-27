import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Overview, SolarData } from './data';
import { ForecastCard } from './forecast-card';

@Component({
  selector: 'app-forecast-page',
  imports: [FormsModule, ForecastCard],
  template: `
    <div class="page-head">
      <h1>Napoved proizvodnje</h1>
      <label>
        Število dni
        <select [ngModel]="days()" (ngModelChange)="days.set($event)">
          @for (n of [3, 5, 7, 14]; track n) {
            <option [ngValue]="n">{{ n }}</option>
          }
        </select>
      </label>
    </div>
    @if (error()) {
      <p class="error">{{ error() }}</p>
    }
    @for (o of overviews(); track o.inst.id) {
      <app-forecast-card [o]="o" [days]="days()" />
    } @empty {
      <p>Ni sistemov.</p>
    }
    <p class="muted">
      Napoved sevanja na nagnjeno ploskev (30°, jug) za lokacijo vsakega sistema: Open-Meteo (open-meteo.com). Pričakovana proizvodnja = sevanje × nazivna moč × 0,8.
      Napoved se osveži vsakih 15 minut.
    </p>
  `,
})
export class ForecastPage implements OnInit {
  protected readonly overviews = signal<Overview[]>([]);
  protected readonly days = signal(7);
  protected readonly error = signal('');
  private readonly data = inject(SolarData);

  ngOnInit() {
    this.data.overview().subscribe({
      next: (os) => this.overviews.set(os),
      error: (e) => this.error.set(`Napaka ${e.status}`),
    });
  }
}
