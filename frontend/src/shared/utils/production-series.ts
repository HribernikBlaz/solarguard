import { SLOTS, TITLE_FORMAT } from '../constants/production-periods';
import { Period } from '../models/period';
import { Series } from '../models/series';
import { dayKey } from './day';

function bucketKey(period: Period, ms: number): string {
  if (period === 'dan') {
    return `${dayKey(ms)} ${new Date(ms).getHours()}`;
  }
  if (period === 'leto') {
    return dayKey(ms).slice(0, 7);
  }

  return dayKey(ms);
}

function slotStart(period: Period, now: Date, k: number): Date {
  const back = SLOTS[period] - 1 - k;
  const [y, m, d] = [now.getFullYear(), now.getMonth(), now.getDate()];
  if (period === 'dan') {
    return new Date(y, m, d, k);
  }
  if (period === 'leto') {
    return new Date(y, m - back, 1);
  }

  return new Date(y, m, d - back);
}

function slotLabel(period: Period, s: Date): string {
  if (period === 'dan') {
    return `${s.getHours()}:00`;
  }
  if (period === 'leto') {
    return s.toLocaleString('sl', { month: 'short' });
  }

  return `${s.getDate()}.${s.getMonth() + 1}.`;
}

export function productionSeries(period: Period, now: number, actual: Map<number, number>, expected: Map<number, number>): Series {
  const sums = new Map<string, number>();
  const expectedSums = new Map<string, number>();
  for (const [t, v] of actual) {
    const key = bucketKey(period, t);
    sums.set(key, (sums.get(key) ?? 0) + v);
    expectedSums.set(key, (expectedSums.get(key) ?? 0) + (expected.get(t) ?? 0));
  }

  const slots = Array.from({ length: SLOTS[period] }, (_, k) => slotStart(period, new Date(now), k));
  const keys = slots.map((s) => bucketKey(period, s.getTime()));
  const bars = keys.map((key) => sums.get(key) ?? 0);
  if (bars.every((b) => b === 0)) {
    return { labels: [], titles: [], bars: [], line: [] };
  }

  const hasExpected = period === 'dan' || period === 'teden';

  return {
    labels: slots.map((s) => slotLabel(period, s)),
    titles: slots.map((s) => s.toLocaleString('sl', TITLE_FORMAT[period])),
    bars,
    line: hasExpected ? keys.map((key) => expectedSums.get(key) ?? 0) : [],
  };
}
