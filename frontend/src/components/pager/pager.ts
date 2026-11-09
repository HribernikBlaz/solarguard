import { Component, computed, input, model } from '@angular/core';
import { PAGE_SIZES, clampPage, pageCount } from '../../shared/utils/paging';

@Component({
  selector: 'app-pager',
  templateUrl: './pager.html',
})
export class Pager {
  readonly total = input.required<number>();
  readonly page = model(1);
  readonly size = model(PAGE_SIZES[0]);
  protected readonly sizes = PAGE_SIZES;
  protected readonly current = computed(() => clampPage(this.page(), this.total(), this.size()));
  protected readonly pages = computed(() => pageCount(this.total(), this.size()));
  protected readonly from = computed(() => (this.total() === 0 ? 0 : (this.current() - 1) * this.size() + 1));
  protected readonly to = computed(() => Math.min(this.total(), this.current() * this.size()));
  protected readonly visible = computed(() => this.total() > PAGE_SIZES[0]);

  protected go(page: number) {
    this.page.set(clampPage(page, this.total(), this.size()));
  }

  protected resize(size: number) {
    this.size.set(size);
    this.page.set(1);
  }
}
