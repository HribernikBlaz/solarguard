import { Period } from '../models/period';

export const SLOTS: Record<Period, number> = { dan: 24, teden: 7, mesec: 30, leto: 12 };

export const TITLE_FORMAT: Record<Period, Intl.DateTimeFormatOptions> = {
  dan: { dateStyle: 'medium', timeStyle: 'short' },
  teden: { dateStyle: 'medium' },
  mesec: { dateStyle: 'medium' },
  leto: { month: 'long', year: 'numeric' },
};
