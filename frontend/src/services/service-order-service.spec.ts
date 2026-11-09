import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ServiceOrder } from './dtos/service-order';
import { ServiceOrderService } from './service-order-service';

const order = (id: string, status: ServiceOrder['status']): ServiceOrder => ({
  id,
  installationId: 'i1',
  installationName: 'Streha',
  installationAddress: 'Cesta 1',
  deviceType: 'Panel',
  serialNumber: 'S1',
  severity: 'Critical',
  description: 'Ni meritev',
  status,
  assigneeId: null,
  assigneeName: null,
  createdAt: '2026-11-03T10:00:00Z',
  closedAt: null,
  summary: null,
  isAssignedToMe: false,
});

describe('ServiceOrderService', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }));

  it('counts orders that are not completed', () => {
    const service = TestBed.inject(ServiceOrderService);
    service.refresh();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/service-orders')
      .flush([order('1', 'Open'), order('2', 'InProgress'), order('3', 'Completed')]);

    expect(service.loaded()).toBe(true);
    expect(service.activeCount()).toBe(2);
  });

  it('keeps the previous orders when a refresh fails', () => {
    const service = TestBed.inject(ServiceOrderService);
    const http = TestBed.inject(HttpTestingController);
    service.refresh();
    http.expectOne('/api/service-orders').flush([order('1', 'Open')]);

    service.refresh();
    http.expectOne('/api/service-orders').flush('x', { status: 500, statusText: 'Server Error' });

    expect(service.failed()).toBe(true);
    expect(service.orders().length).toBe(1);
  });

  it('reloads the orders after a successful status change', () => {
    const service = TestBed.inject(ServiceOrderService);
    const http = TestBed.inject(HttpTestingController);

    service.changeStatus('1', 'Assigned', '').subscribe();
    http.expectOne('/api/service-orders/1/status').flush(null);

    http.expectOne('/api/service-orders').flush([order('1', 'Assigned')]);
    expect(service.orders()[0].status).toBe('Assigned');
  });

  it('forgets the orders on clear', () => {
    const service = TestBed.inject(ServiceOrderService);
    service.refresh();
    TestBed.inject(HttpTestingController).expectOne('/api/service-orders').flush([order('1', 'Open')]);

    service.clear();

    expect(service.orders()).toEqual([]);
    expect(service.loaded()).toBe(false);
  });
});
