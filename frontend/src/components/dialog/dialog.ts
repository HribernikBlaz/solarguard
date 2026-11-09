import { AfterViewInit, Component, ElementRef, input, output, viewChild } from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.html',
})
export class Dialog implements AfterViewInit {
  readonly title = input.required<string>();
  readonly dismissOnBackdrop = input(true);
  readonly dismissed = output<void>();
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  ngAfterViewInit() {
    const element = this.dialog().nativeElement;
    if (typeof element.showModal === 'function') {
      element.showModal();

      return;
    }

    element.setAttribute('open', '');
  }

  protected cancel(event: Event) {
    event.preventDefault();
    this.dismissed.emit();
  }

  protected backdrop(event: MouseEvent) {
    if (this.dismissOnBackdrop() && event.target === this.dialog().nativeElement) {
      this.dismissed.emit();
    }
  }
}
