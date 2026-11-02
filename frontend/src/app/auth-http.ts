import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from './auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const token = auth.session()?.token;
  if (!token || !req.url.startsWith('/api/'))
    return next(req);

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((e: HttpErrorResponse) => {
      if (e.status === 401) {
        auth.logout();
        router.navigate(['/prijava']);
      }
      return throwError(() => e);
    }),
  );
};

export const authGuard: CanActivateChildFn = () =>
  inject(Auth).session() ? true : inject(Router).createUrlTree(['/prijava']);
