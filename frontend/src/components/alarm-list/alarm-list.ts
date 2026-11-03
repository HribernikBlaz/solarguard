import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Overview } from '../../services/dtos/overview';
import { SolarDataService } from '../../services/solar-data-service';

@Component({
  selector: 'app-alarm-list',
  imports: [DatePipe, RouterLink],
  templateUrl: './alarm-list.html',
})
export class AlarmList implements OnInit {
  readonly installationId = input<string>();
  protected readonly overviews = signal<Overview[]>([]);
  protected readonly error = signal('');
  private readonly data = inject(SolarDataService);

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
