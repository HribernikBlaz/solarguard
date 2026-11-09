import { signal } from '@angular/core';
import { clampPage, pageCount, pageSlice, pagedList } from './paging';

describe('paging', () => {
  it('counts at least one page', () => {
    expect(pageCount(0, 10)).toBe(1);
    expect(pageCount(21, 10)).toBe(3);
  });

  it('keeps the page inside the bounds', () => {
    expect(clampPage(0, 25, 10)).toBe(1);
    expect(clampPage(9, 25, 10)).toBe(3);
  });

  it('slices the requested page', () => {
    const items = Array.from({ length: 25 }, (_, i) => i);

    expect(pageSlice(items, 2, 10)).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    expect(pageSlice(items, 3, 10)).toEqual([20, 21, 22, 23, 24]);
  });

  it('falls back to the last page when the list shrinks', () => {
    const items = signal(Array.from({ length: 25 }, (_, i) => i));
    const paged = pagedList(items);
    paged.page.set(3);

    items.set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

    expect(paged.rows()).toEqual([10, 11]);
  });
});
