import { Component, input } from '@angular/core';

@Component({
  selector: 'app-placeholder',
  templateUrl: './placeholder.html',
})
export class Placeholder {
  readonly title = input.required<string>();
  readonly text = input('V pripravi.');
}
