import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { errorText } from '../../shared/http/error-text';

@Component({
  selector: 'app-login-view',
  imports: [FormsModule, RouterLink],
  templateUrl: './login-view.html',
})
export class LoginView {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  readonly busy = signal(false);
  readonly error = signal('');

  submit() {
    if (this.busy()) {
      return;
    }

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
