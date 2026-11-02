import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Auth, errorText } from './auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="auth">
      <h1>Registracija</h1>
      <form (ngSubmit)="submit()">
        <label>
          Ime
          <input name="firstName" autocomplete="given-name" [(ngModel)]="data.firstName" required />
        </label>
        <label>
          Priimek
          <input name="lastName" autocomplete="family-name" [(ngModel)]="data.lastName" required />
        </label>
        <label>
          E-pošta
          <input
            type="email"
            name="email"
            autocomplete="username"
            [(ngModel)]="data.email"
            required
          />
        </label>
        <label>
          Geslo
          <input
            type="password"
            name="password"
            autocomplete="new-password"
            [(ngModel)]="data.password"
            required
          />
          <span class="muted">Najmanj 8 znakov, vsaj ena številka.</span>
        </label>
        @if (error()) {
          <p class="error">{{ error() }}</p>
        }
        <div class="buttons">
          <button type="submit" [disabled]="busy()">Registracija</button>
        </div>
      </form>
      <p class="muted">Že imaš račun? <a routerLink="/prijava">Prijava</a></p>
    </section>
  `,
})
export class Register {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  data = { firstName: '', lastName: '', email: '', password: '' };
  readonly busy = signal(false);
  readonly error = signal('');

  submit() {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.auth
      .register(this.data)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/'),
        error: (e) => this.error.set(errorText(e)),
      });
  }
}
