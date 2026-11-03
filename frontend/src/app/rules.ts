export const PR = 0.8;
export const LOW_RATIO = 0.6;
export const MIN_EXPECTED_KWH = 0.5;
export const WEAK_DAY = 0.5;
export const GOOD_DAY = 1.3;
export const CENA_KWH = 0.16;
export const HOUR = 3_600_000;

export type Status = 'OK' | 'Opozorilo' | 'Alarm' | 'Ni podatkov';
export interface Evaluation {
  status: Status;
  messages: string[];
}

export const expectedKwh = (gtiWm2: number, ratedKw: number) => (gtiWm2 / 1000) * ratedKw * PR;

export function dayKey(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');

  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function sumByDay(entries: Iterable<[number, number]>): Map<string, number> {
  const days = new Map<string, number>();
  for (const [t, v] of entries) days.set(dayKey(t), (days.get(dayKey(t)) ?? 0) + v);

  return days;
}

export function evaluate(expected: Map<number, number>, actual: Map<number, number>, now: number, hasError: boolean): Evaluation {
  const messages = hasError ? ['Naprava javlja napako'] : [];
  const recent = [...actual].filter(([t]) => t <= now && expected.has(t)).sort((a, b) => b[0] - a[0]).slice(0, 3);
  if (!recent.length || now - recent[0][0] > 3 * HOUR)
    return { status: hasError ? 'Alarm' : 'Ni podatkov', messages };

  const low = ([t, v]: [number, number]) => expected.get(t)! > MIN_EXPECTED_KWH && v < LOW_RATIO * expected.get(t)!;
  let status: Status = hasError ? 'Alarm' : 'OK';
  if (recent.length === 3 && recent.every(low)) {
    messages.push('3 ure zapored pod pričakovano: potreben servis');
    status = 'Alarm';
  } else if (low(recent[0])) {
    messages.push(`Proizvodnja pod pričakovano: ${recent[0][1].toFixed(2)} kWh namesto ${expected.get(recent[0][0])!.toFixed(2)} kWh`);
    if (status === 'OK')
      status = 'Opozorilo';
  }
  return { status, messages };
}

export type Period = 'dan' | 'teden' | 'mesec' | 'leto';
export interface Series {
  labels: string[];
  titles: string[];
  bars: number[];
  line: number[];
}

const SLOTS: Record<Period, number> = { dan: 24, teden: 7, mesec: 30, leto: 12 };
const TITLE_FORMAT: Record<Period, Intl.DateTimeFormatOptions> = {
  dan: { dateStyle: 'medium', timeStyle: 'short' },
  teden: { dateStyle: 'medium' },
  mesec: { dateStyle: 'medium' },
  leto: { month: 'long', year: 'numeric' },
};

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
