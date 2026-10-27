import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Overview, SolarData } from './data';

// Tabele alarmov še ni: trenutni alarmi se izračunajo iz pravil, zgodovina pa iz meritev z napako.
@Component({
  selector: 'app-alarm-list',
  imports: [DatePipe, RouterLink],
  template: `
    @if (!installationId()) {
      <h1>Alarmi</h1>
    }
    @if (error()) {
      <p class="error">{{ error() }}</p>
    }
    <table>
      <thead>
        <tr><th>Sistem</th><th>Stopnja</th><th>Opis</th><th>Čas</th></tr>
      </thead>
      <tbody>
        @for (r of rows(); track $index) {
          <tr>
            <td><a [routerLink]="['/sistemi', r.id]">{{ r.system }}</a></td>
            <td><span class="badge" [attr.data-status]="r.level">{{ r.level }}</span></td>
            <td>{{ r.text }}</td>
            <td>{{ r.time ? (r.time | date: 'dd.MM.yyyy HH:mm') : 'zdaj' }}</td>
          </tr>
        } @empty {
          <tr><td colspan="4">Ni alarmov.</td></tr>
        }
      </tbody>
    </table>
  `,
})
export class AlarmList implements OnInit {
  readonly installationId = input<string>();
  protected readonly overviews = signal<Overview[]>([]);
  protected readonly error = signal('');
  private readonly data = inject(SolarData);

  protected readonly rows = computed(() => {
    const mine = this.overviews().filter((o) => !this.installationId() || o.inst.id === this.installationId());
    const current = mine.flatMap((o) => o.result.messages.map((text) => ({ id: o.inst.id, system: o.inst.name, level: o.result.status, text, time: null as number | null })));
    const history = mine
      .flatMap((o) =>
        o.measurements.filter((m) => m.hasError).map((m) => {
          const d = o.devices.find((d) => d.id === m.deviceId);
          return { id: o.inst.id, system: o.inst.name, level: 'Napaka', text: `${d?.type} ${d?.serialNumber} je javila napako`, time: Date.parse(m.timestamp) as number | null };
        }),
      )
      .sort((a, b) => b.time! - a.time!)
      .slice(0, 30);
    return [...current, ...history];
  });

  ngOnInit() {
    this.data.overview().subscribe({
      next: (os) => this.overviews.set(os),
      error: (e) => this.error.set(`Napaka ${e.status}`),
    });
  }
}
