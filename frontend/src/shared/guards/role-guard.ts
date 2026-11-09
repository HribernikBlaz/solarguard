import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { homePath } from '../constants/roles';

export const roleGuard =
  (...roles: string[]): CanActivateFn =>
  () => {
    const role = inject(AuthService).session()?.role;

    return role && roles.includes(role) ? true : inject(Router).createUrlTree([homePath(role)]);
  };
