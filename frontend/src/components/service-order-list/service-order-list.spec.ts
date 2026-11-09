import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ServiceOrder } from '../../services/dtos/service-order';
import { ServiceOrderService } from '../../services/service-order-service';
import { ServiceOrderList } from './service-order-list';

const order = (id: string, status: ServiceOrder['status'], isAssignedToMe: boolean): ServiceOrder => ({
  id,
  installationId: 'i1',
  installationName: 'Streha',
  installationAddress: 'Cesta 1',
  deviceType: 'Panel',
  serialNumber: id,
  severity: 'Critical',
  description: 'Ni meritev',
  status,
  assigneeId: null,
  assigneeName: null,
  createdAt: '2026-11-03T10:00:00Z',
  closedAt: null,
  summary: null,
  isAssignedToMe,
});

describe('ServiceOrderList', () => {
  const setup = async (orders: ServiceOrder[]) => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ServiceOrderList);
    fixture.detectChanges();
    TestBed.inject(ServiceOrderService).refresh();
    http.expectOne('/api/service-orders').flush(orders);
    await fixture.whenStable();
    fixture.detectChanges();

    return { http, fixture, el: fixture.nativeElement as HTMLElement };
  };

  const buttons = (el: HTMLElement) => [...el.querySelectorAll('button')].map((b) => b.textContent!.trim());

  it('offers the next status only on orders assigned to the signed-in user', async () => {
    const { el } = await setup([order('mine', 'Open', true), order('other', 'Open', false), order('done', 'Completed', true)]);

    expect(buttons(el).filter((b) => b.startsWith('Označi'))).toEqual(['Označi: Dodeljen']);
  });

  it('moves to the next status without asking for a summary', async () => {
    const { http, fixture, el } = await setup([order('mine', 'Open', true)]);

    [...el.querySelectorAll('button')].find((b) => b.textContent!.trim() === 'Označi: Dodeljen')!.click();

    const put = http.expectOne('/api/service-orders/mine/status');
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({ status: 'Assigned', summary: '' });
    put.flush(null);
    http.expectOne('/api/service-orders').flush([order('mine', 'Assigned', true)]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(buttons(el)).toContain('Označi: V obdelavi');
  });

  it('asks for a summary before completing and sends it', async () => {
    const { http, fixture, el } = await setup([order('mine', 'InProgress', true)]);

    [...el.querySelectorAll('button')].find((b) => b.textContent!.trim() === 'Zaključi')!.click();
    fixture.detectChanges();
    const submit = [...el.querySelectorAll('button')].find((b) => b.textContent!.trim() === 'Zaključi nalog')!;
    expect(submit.disabled).toBe(true);

    fixture.componentInstance['summary'].set('Zamenjan inverter.');
    fixture.detectChanges();
    expect(submit.disabled).toBe(false);
    submit.click();

    expect(http.expectOne('/api/service-orders/mine/status').request.body).toEqual({ status: 'Completed', summary: 'Zamenjan inverter.' });
  });

  it('shows the server message and reloads the orders when the change is refused', async () => {
    const { http, fixture, el } = await setup([order('mine', 'Open', true)]);

    [...el.querySelectorAll('button')].find((b) => b.textContent!.trim() === 'Označi: Dodeljen')!.click();
    http.expectOne('/api/service-orders/mine/status').flush('Status naloga se je medtem spremenil.', { status: 409, statusText: 'Conflict' });
    http.expectOne('/api/service-orders').flush([order('mine', 'InProgress', true)]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.textContent).toContain('Status naloga se je medtem spremenil.');
    expect(buttons(el)).toContain('Zaključi');
  });

  it('loads the history when the details are opened', async () => {
    const { http, fixture, el } = await setup([order('mine', 'Assigned', false)]);

    [...el.querySelectorAll('button')].find((b) => b.textContent!.trim() === 'Potek')!.click();
    fixture.detectChanges();
    TestBed.tick();
    http.expectOne('/api/service-orders/mine/history').flush([{ status: 'Assigned', changedAt: '2026-11-03T11:00:00Z', changedByName: 'Sergej Serviser' }]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.textContent).toContain('Dodeljen (Sergej Serviser)');
  });
});
