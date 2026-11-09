import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ServiceOrder } from '../../services/dtos/service-order';
import { ServiceOrderChange } from '../../services/dtos/service-order-change';
import { ServiceOrderService } from '../../services/service-order-service';
import { SEVERITY_LABELS } from '../../shared/constants/alarm-labels';
import { NEXT_ORDER_STATUS, ORDER_STATUS_LABELS } from '../../shared/constants/service-order-labels';
import { errorText } from '../../shared/http/error-text';
import { pagedList } from '../../shared/utils/paging';
import { Dialog } from '../dialog/dialog';
import { Pager } from '../pager/pager';

@Component({
  selector: 'app-service-order-list',
  imports: [DatePipe, FormsModule, RouterLink, Dialog, Pager],
  templateUrl: './service-order-list.html',
})
export class ServiceOrderList {
  readonly installationId = input<string>();
  protected readonly service = inject(ServiceOrderService);
  protected readonly severityLabels = SEVERITY_LABELS;
  protected readonly statusLabels = ORDER_STATUS_LABELS;
  protected readonly summaryMax = 1000;
  protected readonly error = signal('');
  protected readonly busyId = signal<string | null>(null);
  protected readonly closingId = signal<string | null>(null);
  protected readonly summary = signal('');
  protected readonly detailId = signal<string | null>(null);
  protected readonly changes = signal<ServiceOrderChange[] | null>(null);
  protected readonly historyFailed = signal(false);
  private historyReads = 0;

  protected readonly rows = computed(() => {
    const id = this.installationId();

    return this.service.orders().filter((o) => !id || o.installationId === id);
  });
  protected readonly paged = pagedList(this.rows);
  // Okna so vezana na nalog: če se nalog medtem spremeni ali izgine, se okno samo zapre ali posodobi.
  protected readonly closing = computed(() => {
    const order = this.service.orders().find((o) => o.id === this.closingId());

    return order && this.next(order) === 'Completed' ? order : null;
  });
  protected readonly detail = computed(() => this.service.orders().find((o) => o.id === this.detailId()) ?? null);
  private readonly detailStatus = computed(() => this.detail()?.status);

  constructor() {
    effect(() => {
      const id = this.detailId();
      this.detailStatus();
      if (id) {
        untracked(() => this.loadHistory(id));
      }
    });
  }

  protected next(o: ServiceOrder) {
    return o.isAssignedToMe ? NEXT_ORDER_STATUS[o.status] : undefined;
  }

  protected actionLabel(next: ServiceOrder['status']) {
    if (next === 'Completed') {
      return 'Zaključi';
    }

    return `Označi: ${ORDER_STATUS_LABELS[next]}`;
  }

  protected advance(o: ServiceOrder) {
    const next = this.next(o);
    if (!next) {
      return;
    }

    this.error.set('');
    if (next === 'Completed') {
      this.summary.set('');
      this.closingId.set(o.id);

      return;
    }

    this.send(o, next, '');
  }

  protected finish(o: ServiceOrder) {
    this.send(o, 'Completed', this.summary());
  }

  protected cancelClosing() {
    if (this.busyId() === null) {
      this.closingId.set(null);
    }
  }

  protected openDetail(o: ServiceOrder) {
    this.changes.set(null);
    this.historyFailed.set(false);
    this.detailId.set(o.id);
  }

  private send(o: ServiceOrder, status: ServiceOrder['status'], summary: string) {
    if (this.busyId() !== null) {
      return;
    }

    this.busyId.set(o.id);
    this.error.set('');
    this.service.changeStatus(o.id, status, summary).subscribe({
      next: () => {
        this.busyId.set(null);
        this.closingId.set(null);
        this.summary.set('');
      },
      error: (e) => {
        this.busyId.set(null);
        this.error.set(errorText(e));
        this.service.refresh();
      },
    });
  }

  private loadHistory(id: string) {
    const read = ++this.historyReads;
    this.service.history(id).subscribe({
      next: (changes) => {
        if (read === this.historyReads) {
          this.changes.set(changes);
          this.historyFailed.set(false);
        }
      },
      error: () => {
        if (read === this.historyReads) {
          this.historyFailed.set(true);
        }
      },
    });
  }
}
