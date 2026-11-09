import { TestBed } from '@angular/core/testing';
import { Dialog } from './dialog';

describe('Dialog', () => {
  const setup = (dismissOnBackdrop = true) => {
    const fixture = TestBed.createComponent(Dialog);
    fixture.componentRef.setInput('title', 'Dodaj sistem');
    fixture.componentRef.setInput('dismissOnBackdrop', dismissOnBackdrop);
    const dismissed = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissed);
    fixture.detectChanges();

    return { fixture, dismissed, dialog: fixture.nativeElement.querySelector('dialog') as HTMLDialogElement };
  };

  it('opens with its title', () => {
    const { dialog } = setup();

    expect(dialog.hasAttribute('open')).toBe(true);
    expect(dialog.textContent).toContain('Dodaj sistem');
  });

  it('is dismissed by Escape without closing itself', () => {
    const { dialog, dismissed } = setup();
    const event = new Event('cancel', { cancelable: true });

    dialog.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(dismissed).toHaveBeenCalledTimes(1);
  });

  it('is dismissed by the close button and by a click on the backdrop', () => {
    const { dialog, dismissed } = setup();

    dialog.querySelector<HTMLButtonElement>('.dialog-close')!.click();
    dialog.click();

    expect(dismissed).toHaveBeenCalledTimes(2);
  });

  it('ignores a click on the backdrop when asked to', () => {
    const { dialog, dismissed } = setup(false);

    dialog.click();

    expect(dismissed).not.toHaveBeenCalled();
  });
});
