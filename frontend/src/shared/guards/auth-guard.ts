import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

export const authGuard: CanActivateChildFn = () =>
  inject(AuthService).session() ? true : inject(Router).createUrlTree(['/prijava']);
