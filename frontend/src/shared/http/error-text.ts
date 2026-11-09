import { HttpErrorResponse } from '@angular/common/http';

export function errorText(e: unknown): string {
  const err = e as HttpErrorResponse;
  if (err.status === 0) {
    return 'Strežnik ni dosegljiv.';
  }

  if (typeof err.error === 'string' && err.error && err.status >= 400 && err.status < 500) {
    return err.error;
  }

  return err.error?.errors?.join(' ') ?? err.error?.error ?? 'Napaka pri izvedbi.';
}
