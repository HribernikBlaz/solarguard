import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ForecastView } from './forecast-view';

const installation = (id: string, name: string, address: string) => ({ id, name, address, ratedPowerKw: 5 });

describe('ForecastView', () => {
  const setup = async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ForecastView);
    fixture.detectChanges();
    http.expectOne('/api/installations').flush([installation('a', 'Hiša Novak', 'Ljubljana'), installation('b', 'Kmetija Kovač', 'Maribor')]);
    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, el: fixture.nativeElement as HTMLElement };
  };

  it('lists the systems with a link to the forecast of each one', async () => {
    const { el } = await setup();

    const links = [...el.querySelectorAll<HTMLAnchorElement>('tbody a')].map((a) => a.getAttribute('href'));

    expect(links).toEqual(['/napoved/a', '/napoved/b']);
  });

  it('searches by name or address', async () => {
    const { fixture, el } = await setup();

    fixture.componentInstance['setSearch']('maribor');
    fixture.detectChanges();

    expect(el.querySelectorAll('tbody tr').length).toBe(1);
    expect(el.textContent).toContain('Kmetija Kovač');
  });
});
