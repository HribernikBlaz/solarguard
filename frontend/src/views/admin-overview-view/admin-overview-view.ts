import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Pager } from '../../components/pager/pager';
import { AdminOverview } from '../../services/dtos/admin-overview';
import { AdminService } from '../../services/admin-service';
import { ORDER_STATUS_LABELS } from '../../shared/constants/service-order-labels';
import { errorText } from '../../shared/http/error-text';
import { pagedList } from '../../shared/utils/paging';

type StatusFilter = '' | 'active' | 'inactive';

@Component({
  selector: 'app-admin-overview-view',
  imports: [DatePipe, FormsModule, RouterLink, Pager],
  templateUrl: './admin-overview-view.html',
})
export class AdminOverviewView implements OnInit {
  protected readonly overview = signal<AdminOverview | null>(null);
  protected readonly status = signal<StatusFilter>('');
  protected readonly search = signal('');
  protected readonly error = signal('');
  protected readonly orderCards = [
    { key: 'open', label: ORDER_STATUS_LABELS.Open },
    { key: 'assigned', label: ORDER_STATUS_LABELS.Assigned },
    { key: 'inProgress', label: ORDER_STATUS_LABELS.InProgress },
    { key: 'completed', label: ORDER_STATUS_LABELS.Completed },
  ] as const;
  private readonly service = inject(AdminService);
  private reads = 0;

  protected readonly systems = computed(() => {
    const query = this.search().trim().toLowerCase();
    const status = this.status();

    return (this.overview()?.systems ?? []).filter((s) => {
      const matchesStatus = !status || s.active === (status === 'active');
      const text = `${s.name} ${s.ownerName ?? ''} ${s.ownerEmail ?? ''}`.toLowerCase();

      return matchesStatus && (!query || text.includes(query));
    });
  });
  protected readonly paged = pagedList(this.systems);

  ngOnInit() {
    this.load();
  }

  protected setStatus(value: StatusFilter) {
    this.status.set(value);
    this.paged.page.set(1);
  }

  protected setSearch(value: string) {
    this.search.set(value);
    this.paged.page.set(1);
  }

  protected load() {
    const read = ++this.reads;
    this.service.overview().subscribe({
      next: (overview) => {
        if (read === this.reads) {
          this.overview.set(overview);
          this.error.set('');
        }
      },
      error: (e) => {
        if (read === this.reads) {
          this.error.set(errorText(e));
        }
      },
    });
  }
}
