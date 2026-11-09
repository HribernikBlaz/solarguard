import { TestBed } from '@angular/core/testing';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  const setup = (inputs: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(ConfirmDialog);
    fixture.componentRef.setInput('title', 'Izbriši sistem');
    fixture.componentRef.setInput('message', 'Res želite izbrisati "Streha"?');
    fixture.componentRef.setInput('confirmLabel', 'Izbriši');
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    const confirmed = vi.fn();
    const cancelled = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);
    fixture.componentInstance.cancelled.subscribe(cancelled);
    fixture.detectChanges();

    return { el: fixture.nativeElement as HTMLElement, confirmed, cancelled };
  };

  const button = (el: HTMLElement, text: string) => [...el.querySelectorAll('button')].find((b) => b.textContent!.trim() === text)!;

  it('confirms and cancels', () => {
    const { el, confirmed, cancelled } = setup();

    button(el, 'Izbriši').click();
    button(el, 'Prekliči').click();

    expect(confirmed).toHaveBeenCalledTimes(1);
    expect(cancelled).toHaveBeenCalledTimes(1);
  });

  it('shows the error and blocks a second confirmation while busy', () => {
    const { el } = setup({ busy: true, error: 'Ima nezaključen nalog.' });

    expect(el.textContent).toContain('Ima nezaključen nalog.');
    expect(button(el, 'Izbriši').disabled).toBe(true);
  });
});
