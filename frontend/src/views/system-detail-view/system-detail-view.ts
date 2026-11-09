import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlarmList } from '../../components/alarm-list/alarm-list';
import { ForecastCard } from '../../components/forecast-card/forecast-card';
import { ServiceOrderList } from '../../components/service-order-list/service-order-list';
import { Overview } from '../../services/dtos/overview';
import { AuthService } from '../../services/auth-service';
import { SolarDataService } from '../../services/solar-data-service';
import { ROLES } from '../../shared/constants/roles';
import { TABS, TECHNICIAN_TABS } from '../../shared/constants/system-tabs';

@Component({
  selector: 'app-system-detail-view',
  imports: [DatePipe, DecimalPipe, FormsModule, RouterLink, AlarmList, ForecastCard, ServiceOrderList],
  templateUrl: './system-detail-view.html',
})
export class SystemDetailView implements OnInit {
  readonly id = input.required<string>();
  protected readonly isTechnician = inject(AuthService).session()?.role === ROLES.technician;
  protected readonly tabs = this.isTechnician ? TABS.filter((t) => TECHNICIAN_TABS.includes(t[0])) : TABS;
  protected readonly tab = signal<(typeof TABS)[number][0]>('naprave');
  protected readonly days = signal(7);
  protected readonly o = signal<Overview | null>(null);
  protected readonly error = signal('');
  private readonly data = inject(SolarDataService);

  protected readonly latest = computed(() => [...(this.o()?.measurements ?? [])].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, 24));

  protected deviceName(id: string) {
    const d = this.o()?.devices.find((d) => d.id === id);

    return d ? `${d.type} ${d.serialNumber}` : id;
  }

  ngOnInit() {
    this.data.overview(this.id()).subscribe({
      next: (os) => {
        this.o.set(os.find((o) => o.inst.id === this.id()) ?? null);
        if (!this.o()) {
          this.error.set('Sistem ne obstaja.');
        }
      },
      error: (e) => this.error.set(`Napaka ${e.status}`),
    });
  }
}
