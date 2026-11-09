export const WARRANTY_WARNING_DAYS = 30;

export type WarrantyState = 'valid' | 'expiring' | 'expired';

const DAY_MS = 86_400_000;

function dayNumber(year: number, month: number, day: number) {
  return Math.floor(Date.UTC(year, month, day) / DAY_MS);
}

// until je datum v obliki yyyy-MM-dd; primerja se po koledarskih dneh v lokalnem času.
export function warrantyStatus(until: string, today = new Date()) {
  const [year, month, day] = until.split('-').map(Number);
  const daysLeft = dayNumber(year, month - 1, day) - dayNumber(today.getFullYear(), today.getMonth(), today.getDate());
  let state: WarrantyState = 'valid';
  if (daysLeft < 0) {
    state = 'expired';
  } else if (daysLeft <= WARRANTY_WARNING_DAYS) {
    state = 'expiring';
  }

  return { state, daysLeft };
}
