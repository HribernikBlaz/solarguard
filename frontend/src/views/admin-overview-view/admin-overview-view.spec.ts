import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminInstallation, AdminOverview } from '../../services/dtos/admin-overview';
import { AdminOverviewView } from './admin-overview-view';

const system = (id: string, name: string, ownerName: string, active: boolean): AdminInstallation => ({
  id,
  name,
  address: 'Cesta 1',
  ratedPowerKw: 5,
  ownerName,
  ownerEmail: `${ownerName.toLowerCase()}@test.si`,
  deviceCount: 2,
  lastMeasurementAt: active ? '2026-11-09T10:00:00Z' : null,
  openOrders: 1,
  active,
});

const overview: AdminOverview = {
  installations: 3,
  devices: 6,
  users: 4,
  activeUsers: 2,
  orders: { open: 5, assigned: 1, inProgress: 2, completed: 7 },
  systems: [system('a', 'Hiša Novak', 'Ana', true), system('b', 'Kmetija Kovač', 'Boris', false), system('c', 'Garaža', 'Boris', true)],
};

describe('AdminOverviewView', () => {
  const setup = async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(AdminOverviewView);
    fixture.detectChanges();
    http.expectOne('/api/admin/overview').flush(overview);
    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, el: fixture.nativeElement as HTMLElement };
  };

  const names = (el: HTMLElement) => [...el.querySelectorAll('tbody tr')].map((r) => r.children[0].textContent!.trim());

  it('shows the platform totals and the orders per status', async () => {
    const { el } = await setup();
    const cards = Object.fromEntries([...el.querySelectorAll('.kpi')].map((k) => [k.querySelector('span')!.textContent!.trim(), k.querySelector('strong')!.textContent!.trim()]));

    expect(cards).toEqual({
      Sistemi: '3',
      Naprave: '6',
      'Aktivni uporabniki': '2',
      Odprt: '5',
      Dodeljen: '1',
      'V obdelavi': '2',
      Zaključen: '7',
    });
    expect(el.textContent).toContain('od 4 registriranih');
  });

  it('filters the systems by status', async () => {
    const { fixture, el } = await setup();

    fixture.componentInstance['setStatus']('inactive');
    fixture.detectChanges();

    expect(names(el)).toEqual(['Kmetija Kovač']);
  });

  it('searches by system name or owner', async () => {
    const { fixture, el } = await setup();

    fixture.componentInstance['setSearch']('boris');
    fixture.detectChanges();
    expect(names(el)).toEqual(['Kmetija Kovač', 'Garaža']);

    fixture.componentInstance['setSearch']('hiša');
    fixture.detectChanges();
    expect(names(el)).toEqual(['Hiša Novak']);
  });

  it('links each system to its details', async () => {
    const { el } = await setup();

    const links = [...el.querySelectorAll<HTMLAnchorElement>('tbody a')].map((a) => a.getAttribute('href'));

    expect(links).toEqual(['/sistemi/a', '/sistemi/b', '/sistemi/c']);
  });

  it('keeps showing the totals when a refresh fails', async () => {
    const { fixture, el } = await setup();
    const http = TestBed.inject(HttpTestingController);

    fixture.componentInstance['load']();
    http.expectOne('/api/admin/overview').flush('x', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(el.textContent).toContain('Hiša Novak');
  });
});
