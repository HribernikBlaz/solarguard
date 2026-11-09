import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import localeSl from '@angular/common/locales/sl';
import { TestBed } from '@angular/core/testing';
import { Forecast } from '../../services/dtos/forecast';
import { Installation } from '../../services/dtos/installation';
import { ForecastCard } from './forecast-card';

const installation = (id: string, electricityPrice: number | null): Installation => ({
  id,
  name: 'Streha ' + id,
  address: 'Cesta 1',
  latitude: 46,
  longitude: 14,
  installationDate: '2024-01-01',
  ratedPowerKw: 5,
  electricityPrice,
});

const forecast: Forecast = {
  baselineKwh: 10,
  warning: null,
  days: [
    { date: '2026-11-09', expectedKwh: 12, cloudPercent: 20, grade: 'Normal' },
    { date: '2026-11-10', expectedKwh: 3, cloudPercent: 100, grade: 'Weak' },
    { date: '2026-11-11', expectedKwh: 20, cloudPercent: 0, grade: 'Good' },
  ],
};

registerLocaleData(localeSl);

describe('ForecastCard', () => {
  const setup = (inst: Installation, days = 7) => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ForecastCard);
    fixture.componentRef.setInput('installation', inst);
    fixture.componentRef.setInput('days', days);
    fixture.detectChanges();
    TestBed.tick();

    return { http, fixture, el: fixture.nativeElement as HTMLElement };
  };

  const show = async (fixture: { whenStable(): Promise<unknown>; detectChanges(): void }) => {
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const rows = (el: HTMLElement) => [...el.querySelectorAll('tbody tr')].map((r) => [...r.children].map((c) => c.textContent!.trim()));

  it('shows each day with the expected kWh, grade and saving', async () => {
    const { http, fixture, el } = setup(installation('a', 0.2));

    http.expectOne((r) => r.url === '/api/installations/a/forecast').flush(forecast);
    await show(fixture);

    const body = rows(el);
    expect(body.length).toBe(3);
    expect(body[0].slice(1)).toEqual(['12.0', '20 %', 'običajen', '2.40']);
    expect(body[1][3]).toBe('šibek');
    expect(body[2][3]).toBe('odličen');
  });

  it('shows only the chosen number of days', async () => {
    const { http, fixture, el } = setup(installation('a', 0.2), 2);

    http.expectOne((r) => r.url === '/api/installations/a/forecast').flush(forecast);
    await show(fixture);

    expect(rows(el).length).toBe(2);
  });

  it('shows no saving when the price is missing', async () => {
    const { http, fixture, el } = setup(installation('a', null));

    http.expectOne((r) => r.url === '/api/installations/a/forecast').flush(forecast);
    await show(fixture);

    expect(rows(el)[0][4]).toBe('–');
    expect(el.textContent).toContain('Cena elektrike ni vnesena');
  });

  it('shows the message from the server when the weather is unavailable', async () => {
    const { http, fixture, el } = setup(installation('a', 0.2));

    http.expectOne((r) => r.url === '/api/installations/a/forecast').flush({ days: [], baselineKwh: 0, warning: 'Vremenska napoved za lokacijo sistema trenutno ni na voljo.' });
    await show(fixture);

    expect(el.textContent).toContain('Vremenska napoved za lokacijo sistema trenutno ni na voljo.');
    expect(el.querySelector('table')).toBeNull();
  });

  it('says so when the forecast cannot be loaded', async () => {
    const { http, fixture, el } = setup(installation('a', 0.2));

    http.expectOne((r) => r.url === '/api/installations/a/forecast').flush('x', { status: 500, statusText: 'Server Error' });
    await show(fixture);

    expect(el.textContent).toContain('Napovedi ni mogoče naložiti.');
  });
});
