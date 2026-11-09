import { AfterViewInit, Component, ElementRef, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { Overview } from '../../services/dtos/overview';
import { SolarDataService } from '../../services/solar-data-service';
import { COLORS } from '../../shared/constants/status-colors';
import { dayKey, sumByDay } from '../../shared/utils/day';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.html',
  styleUrl: './map-view.scss',
})
export class MapView implements AfterViewInit, OnDestroy {
  protected readonly statuses = Object.entries(COLORS);
  protected readonly error = signal('');
  private readonly el = viewChild.required<ElementRef<HTMLElement>>('map');
  private readonly data = inject(SolarDataService);
  private readonly router = inject(Router);
  private map?: L.Map;

  ngAfterViewInit() {
    this.map = L.map(this.el().nativeElement).setView([46.15, 14.99], 8);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    this.data.overview().subscribe({
      next: (os) => this.mark(os),
      error: (e) => this.error.set(`Napaka ${e.status}`),
    });
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  private mark(os: Overview[]) {
    const map = this.map!;
    for (const o of os) {
      L.circleMarker([o.inst.latitude, o.inst.longitude], { radius: 12, color: '#fff', weight: 2, fillColor: COLORS[o.result.status], fillOpacity: 0.95 })
        .addTo(map)
        .bindTooltip(o.inst.name, { permanent: true, direction: 'top', offset: [0, -10] })
        .bindPopup(this.popup(o));
    }
    if (os.length) {
      map.fitBounds(L.latLngBounds(os.map((o) => [o.inst.latitude, o.inst.longitude] as [number, number])), { padding: [80, 80], maxZoom: 12 });
    }
  }

  private tomorrowText(price: number | null, tomorrowKwh: number | undefined) {
    if (tomorrowKwh === undefined) {
      return 'Napoved ni na voljo';
    }
    if (price === null) {
      return `Jutri pričakujem ${tomorrowKwh.toFixed(1)} kWh`;
    }

    return `Jutri pričakujem ${tomorrowKwh.toFixed(1)} kWh (${(tomorrowKwh * price).toFixed(2)} €)`;
  }

  private popup(o: Overview) {
    const days = sumByDay(o.expected);
    const tomorrow = days.get(dayKey(Date.now() + 24 * 3_600_000));
    const root = document.createElement('div');
    const line = (text: string, tag = 'div') => root.appendChild(Object.assign(document.createElement(tag), { textContent: text }));
    line(o.inst.name, 'strong');
    line(o.inst.address);
    line(`Nazivna moč: ${o.inst.ratedPowerKw} kW · ${o.result.status}`);
    line(this.tomorrowText(o.inst.electricityPrice, tomorrow));
    const a = Object.assign(document.createElement('a'), { href: `/sistemi/${o.inst.id}`, textContent: 'Podrobnosti →' });
    a.addEventListener('click', (e) => {
      e.preventDefault();
      this.router.navigate(['/sistemi', o.inst.id]);
    });
    root.appendChild(a);

    return root;
  }
}
