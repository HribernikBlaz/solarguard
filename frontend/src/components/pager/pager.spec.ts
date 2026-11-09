import { TestBed } from '@angular/core/testing';
import { Pager } from './pager';

describe('Pager', () => {
  const setup = (total: number, page = 1) => {
    const fixture = TestBed.createComponent(Pager);
    fixture.componentRef.setInput('total', total);
    fixture.componentRef.setInput('page', page);
    fixture.detectChanges();

    return { fixture, el: fixture.nativeElement as HTMLElement };
  };

  const click = (el: HTMLElement, label: string) => el.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!.click();

  it('is hidden when everything fits on one page', () => {
    const { el } = setup(10);

    expect(el.querySelector('nav')).toBeNull();
  });

  it('shows the range and moves between pages', () => {
    const { fixture, el } = setup(25);
    expect(el.textContent).toContain('1–10 od 25');

    click(el, 'Naslednja stran');
    fixture.detectChanges();

    expect(fixture.componentInstance.page()).toBe(2);
    expect(el.textContent).toContain('11–20 od 25');
  });

  it('does not go before the first or after the last page', () => {
    const { fixture, el } = setup(25, 3);

    expect(el.querySelector<HTMLButtonElement>('[aria-label="Naslednja stran"]')!.disabled).toBe(true);
    click(el, 'Naslednja stran');
    expect(fixture.componentInstance.page()).toBe(3);
  });

  it('returns to the first page when the page size changes', () => {
    const { fixture, el } = setup(60, 3);
    const select = el.querySelector('select')!;

    select.value = '25';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.componentInstance.size()).toBe(25);
    expect(fixture.componentInstance.page()).toBe(1);
  });
});
