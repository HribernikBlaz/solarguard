import { Component, input } from '@angular/core';

// Zavihki in strani, za katere še ni backend tabel (servisni nalogi, poročila, nastavitve).
@Component({
  selector: 'app-placeholder',
  template: `
    <section class="card">
      <h2>{{ title() }}</h2>
      <p class="placeholder">{{ text() }}</p>
    </section>
  `,
})
export class Placeholder {
  readonly title = input.required<string>();
  readonly text = input('V pripravi.');
}
