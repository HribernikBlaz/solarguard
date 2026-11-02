import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Auth, errorText } from './auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="auth">
      <h1>Prijava</h1>
      <form (ngSubmit)="submit()">
        <label>
          E-pošta
          <input type="email" name="email" autocomplete="username" [(ngModel)]="email" required />
        </label>
        <label>
          Geslo
          <input
            type="password"
            name="password"
            autocomplete="current-password"
            [(ngModel)]="password"
            required
          />
        </label>
        @if (error()) {
          <p class="error">{{ error() }}</p>
        }
        <div class="buttons">
          <button type="submit" [disabled]="busy()">Prijava</button>
        </div>
      </form>
      <p class="muted">Še nimaš računa? <a routerLink="/registracija">Registracija</a></p>
    </section>
  `,
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  email = '';
  password = '';
  readonly busy = signal(false);
  readonly error = signal('');

  submit() {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.auth
      .login(this.email, this.password)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/'),
        error: (e) => this.error.set(errorText(e)),
      });
  }
}
