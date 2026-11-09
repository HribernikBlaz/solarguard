import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Pager } from '../../components/pager/pager';
import { Installation } from '../../services/dtos/installation';
import { InstallationService } from '../../services/installation-service';
import { errorText } from '../../shared/http/error-text';
import { pagedList } from '../../shared/utils/paging';

@Component({
  selector: 'app-forecast-view',
  imports: [FormsModule, RouterLink, Pager],
  templateUrl: './forecast-view.html',
})
export class ForecastView implements OnInit {
  protected readonly installations = signal<Installation[]>([]);
  protected readonly ready = signal(false);
  protected readonly search = signal('');
  protected readonly error = signal('');
  private readonly service = inject(InstallationService);

  protected readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();

    return this.installations().filter((i) => !query || `${i.name} ${i.address}`.toLowerCase().includes(query));
  });
  protected readonly paged = pagedList(this.filtered);

  ngOnInit() {
    this.service.getAll().subscribe({
      next: (installations) => {
        this.installations.set(installations);
        this.ready.set(true);
      },
      error: (e) => this.error.set(errorText(e)),
    });
  }

  protected setSearch(value: string) {
    this.search.set(value);
    this.paged.page.set(1);
  }
}
