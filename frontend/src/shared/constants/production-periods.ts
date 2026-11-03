import { Period } from '../models/period';

const ZONE = 'Europe/Ljubljana';

export const HOUR_FORMAT = new Intl.DateTimeFormat('sl', { hour: 'numeric', hourCycle: 'h23', timeZone: ZONE });
export const DAY_FORMAT = new Intl.DateTimeFormat('sl', { day: 'numeric', timeZone: ZONE });
export const MONTH_NUMBER_FORMAT = new Intl.DateTimeFormat('sl', { month: 'numeric', timeZone: ZONE });
export const MONTH_NAME_FORMAT = new Intl.DateTimeFormat('sl', { month: 'short', timeZone: ZONE });

export const TITLE_FORMAT: Record<Period, Intl.DateTimeFormat> = {
  dan: new Intl.DateTimeFormat('sl', { dateStyle: 'medium', timeStyle: 'short', timeZone: ZONE }),
  teden: new Intl.DateTimeFormat('sl', { dateStyle: 'medium', timeZone: ZONE }),
  mesec: new Intl.DateTimeFormat('sl', { dateStyle: 'medium', timeZone: ZONE }),
  leto: new Intl.DateTimeFormat('sl', { month: 'long', year: 'numeric', timeZone: ZONE }),
};
