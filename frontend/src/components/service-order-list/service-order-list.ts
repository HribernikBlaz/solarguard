import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServiceOrderService } from '../../services/service-order-service';
import { SEVERITY_LABELS } from '../../shared/constants/alarm-labels';
import { ORDER_STATUS_LABELS } from '../../shared/constants/service-order-labels';

@Component({
  selector: 'app-service-order-list',
  imports: [DatePipe, RouterLink],
  templateUrl: './service-order-list.html',
})
export class ServiceOrderList {
  readonly installationId = input<string>();
  protected readonly service = inject(ServiceOrderService);
  protected readonly severityLabels = SEVERITY_LABELS;
  protected readonly statusLabels = ORDER_STATUS_LABELS;

  protected readonly rows = computed(() => {
    const id = this.installationId();

    return this.service.orders().filter((o) => !id || o.installationId === id);
  });
}
