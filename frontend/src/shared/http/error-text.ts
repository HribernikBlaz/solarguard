import { HttpErrorResponse } from '@angular/common/http';

export function errorText(e: unknown): string {
  const err = e as HttpErrorResponse;
  if (err.status === 0) {
    return 'Strežnik ni dosegljiv.';
  }

  return err.error?.errors?.join(' ') ?? err.error?.error ?? 'Napaka pri izvedbi.';
}
