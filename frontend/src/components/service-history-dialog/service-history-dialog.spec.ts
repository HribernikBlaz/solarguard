import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Device } from '../../services/dtos/device';
import { ServiceHistoryItem } from '../../services/dtos/service-history-item';
import { ServiceHistoryDialog } from './service-history-dialog';

const device: Device = {
  id: 'd1',
  installationId: 'i1',
  type: 'Inverter',
  manufacturer: 'SMA',
  model: 'Tripower',
  serialNumber: 'SMA-1',
  installedOn: '2024-01-01',
  warrantyUntil: '2030-01-01',
};

const item = (orderId: string, status: ServiceHistoryItem['status']): ServiceHistoryItem => ({
  orderId,
  status,
  createdAt: '2026-11-03T10:00:00Z',
  closedAt: status === 'Completed' ? '2026-11-04T10:00:00Z' : null,
  description: 'Ni meritev več kot 2 uri',
  summary: status === 'Completed' ? 'Zamenjan konektor.' : null,
  technicianName: 'Sergej Serviser',
});

describe('ServiceHistoryDialog', () => {
  const setup = () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ServiceHistoryDialog);
    fixture.componentRef.setInput('device', device);
    fixture.detectChanges();
    TestBed.tick();

    return { http, fixture, el: fixture.nativeElement as HTMLElement };
  };

  const show = async (fixture: { whenStable(): Promise<unknown>; detectChanges(): void }) => {
    await fixture.whenStable();
    fixture.detectChanges();
  };

  it('lists the orders with the work done and the technician', async () => {
    const { http, fixture, el } = setup();

    http.expectOne('/api/devices/d1/service-history').flush([item('o1', 'Completed'), item('o2', 'Open')]);
    await show(fixture);

    expect(el.textContent).toContain('Servisna zgodovina: Inverter SMA-1');
    expect(el.textContent).toContain('Zamenjan konektor.');
    expect(el.textContent).toContain('Sergej Serviser');
    expect(el.querySelectorAll('tbody tr').length).toBe(2);
  });

  it('says there are no interventions when the history is empty', async () => {
    const { http, fixture, el } = setup();

    http.expectOne('/api/devices/d1/service-history').flush([]);
    await show(fixture);

    expect(el.textContent).toContain('Ni zabeleženih servisnih posegov');
  });

  it('asks again with the chosen period', async () => {
    const { http, fixture } = setup();
    http.expectOne('/api/devices/d1/service-history').flush([]);

    fixture.componentInstance['from'].set('2026-11-01');
    fixture.componentInstance['to'].set('2026-11-30');
    fixture.detectChanges();
    TestBed.tick();

    const request = http.expectOne((r) => r.url === '/api/devices/d1/service-history' && r.params.get('from') === '2026-11-01');
    expect(request.request.params.get('to')).toBe('2026-11-30');
    request.flush([]);
  });

  it('does not ask while the period is reversed', async () => {
    const { http, fixture, el } = setup();
    http.expectOne('/api/devices/d1/service-history').flush([]);

    fixture.componentInstance['from'].set('2026-11-10');
    fixture.componentInstance['to'].set('2026-11-01');
    fixture.detectChanges();
    TestBed.tick();
    await show(fixture);

    http.expectNone((r) => r.params.has('from'));
    expect(el.textContent).toContain('Datum Od mora biti pred datumom Do.');
  });

  it('shows an error when the first load fails', async () => {
    const { http, fixture, el } = setup();

    http.expectOne('/api/devices/d1/service-history').flush('x', { status: 500, statusText: 'Server Error' });
    await show(fixture);

    expect(el.textContent).toContain('Zgodovine ni mogoče naložiti.');
  });
});
