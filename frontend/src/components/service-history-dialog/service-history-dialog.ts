import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Device } from '../../services/dtos/device';
import { ServiceHistoryItem } from '../../services/dtos/service-history-item';
import { DeviceService } from '../../services/device-service';
import { ORDER_STATUS_LABELS } from '../../shared/constants/service-order-labels';
import { Dialog } from '../dialog/dialog';

@Component({
  selector: 'app-service-history-dialog',
  imports: [DatePipe, FormsModule, Dialog],
  templateUrl: './service-history-dialog.html',
})
export class ServiceHistoryDialog {
  readonly device = input.required<Device>();
  readonly dismissed = output<void>();
  protected readonly statusLabels = ORDER_STATUS_LABELS;
  protected readonly from = signal('');
  protected readonly to = signal('');
  protected readonly items = signal<ServiceHistoryItem[] | null>(null);
  protected readonly failed = signal(false);
  protected readonly title = computed(() => `Servisna zgodovina: ${this.device().type} ${this.device().serialNumber}`);
  protected readonly rangeInvalid = computed(() => !!this.from() && !!this.to() && this.from() > this.to());
  private readonly service = inject(DeviceService);
  private reads = 0;

  constructor() {
    effect(() => {
      const from = this.from();
      const to = this.to();
      if (!this.rangeInvalid()) {
        untracked(() => this.load(from, to));
      }
    });
  }

  protected clear() {
    this.from.set('');
    this.to.set('');
  }

  private load(from: string, to: string) {
    const read = ++this.reads;
    this.service.serviceHistory(this.device().id, from, to).subscribe({
      next: (items) => {
        if (read === this.reads) {
          this.items.set(items);
          this.failed.set(false);
        }
      },
      error: () => {
        if (read === this.reads) {
          this.failed.set(true);
        }
      },
    });
  }
}
