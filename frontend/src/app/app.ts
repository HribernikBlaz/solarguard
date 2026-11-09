import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { EMPTY, switchMap, timer } from 'rxjs';
import { AuthService } from '../services/auth-service';
import { ServiceOrderService } from '../services/service-order-service';
import { menuFor } from '../shared/constants/menu';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly auth = inject(AuthService);
  protected readonly orders = inject(ServiceOrderService);
  protected readonly mainMenu = computed(() => menuFor(this.auth.session()?.role, 'main'));
  protected readonly dataMenu = computed(() => menuFor(this.auth.session()?.role, 'data'));
  private readonly router = inject(Router);

  constructor() {
    toObservable(this.auth.session)
      .pipe(
        switchMap((session) => {
          if (!session) {
            this.orders.clear();

            return EMPTY;
          }

          return timer(0, 30_000);
        }),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.orders.refresh());
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/prijava']);
  }
}
