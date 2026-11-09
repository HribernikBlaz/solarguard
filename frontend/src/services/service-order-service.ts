import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { EMPTY, Subject, catchError, switchMap, tap } from 'rxjs';
import { ServiceOrder } from './dtos/service-order';
import { ServiceOrderChange } from './dtos/service-order-change';

@Injectable({ providedIn: 'root' })
export class ServiceOrderService {
  readonly orders = signal<ServiceOrder[]>([]);
  readonly loaded = signal(false);
  readonly failed = signal(false);
  readonly activeCount = computed(() => this.orders().filter((o) => o.status !== 'Completed').length);

  private readonly http = inject(HttpClient);
  private readonly requests = new Subject<void>();

  constructor() {
    this.requests
      .pipe(switchMap(() => this.http.get<ServiceOrder[]>('/api/service-orders').pipe(catchError(() => this.fail()))))
      .subscribe((orders) => {
        this.orders.set(orders);
        this.loaded.set(true);
        this.failed.set(false);
      });
  }

  refresh() {
    this.requests.next();
  }

  changeStatus(id: string, status: ServiceOrder['status'], summary: string) {
    return this.http.put<void>(`/api/service-orders/${id}/status`, { status, summary }).pipe(tap(() => this.refresh()));
  }

  history(id: string) {
    return this.http.get<ServiceOrderChange[]>(`/api/service-orders/${id}/history`);
  }

  clear() {
    this.orders.set([]);
    this.loaded.set(false);
    this.failed.set(false);
  }

  private fail() {
    this.failed.set(true);

    return EMPTY;
  }
}
