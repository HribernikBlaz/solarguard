import { Signal, computed, signal } from '@angular/core';

export const PAGE_SIZES = [10, 25, 50];

export function pageCount(total: number, size: number) {
  return Math.max(1, Math.ceil(total / size));
}

export function clampPage(page: number, total: number, size: number) {
  return Math.min(Math.max(1, page), pageCount(total, size));
}

export function pageSlice<T>(items: readonly T[], page: number, size: number): T[] {
  const current = clampPage(page, items.length, size);

  return items.slice((current - 1) * size, current * size);
}

// Stran in velikost sta zapisljivi, da ju lahko pager veže dvosmerno; prikazana stran je vedno znotraj mej.
export function pagedList<T>(items: Signal<readonly T[]>, initialSize = PAGE_SIZES[0]) {
  const page = signal(1);
  const size = signal(initialSize);
  const rows = computed(() => pageSlice(items(), page(), size()));

  return { page, size, rows };
}
