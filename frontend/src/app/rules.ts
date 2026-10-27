// Zrcali prototype/SolarGuard.Rules/ProductionRules.cs: ista formula in pragovi. Ključ map = konec ure v ms (UTC), kot v Open-Meteo.
export const PR = 0.8;
export const LOW_RATIO = 0.6;
export const MIN_EXPECTED_KWH = 0.5;
export const WEAK_DAY = 0.5;
export const GOOD_DAY = 1.3;
export const CENA_KWH = 0.16; // shortcut: fiksna cena, ko bo tarifa v bazi, jo preberi od tam
export const HOUR = 3_600_000;

export type Status = 'OK' | 'Opozorilo' | 'Alarm' | 'Ni podatkov';
export interface Evaluation {
  status: Status;
  messages: string[];
}

export const expectedKwh = (gtiWm2: number, ratedKw: number) => (gtiWm2 / 1000) * ratedKw * PR;

// shortcut: dan po lokalnem času brskalnika (predpostavimo Slovenijo), ko bo več držav, uporabi IANA časovni pas sistema
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
  if (!recent.length || now - recent[0][0] > 3 * HOUR) return { status: hasError ? 'Alarm' : 'Ni podatkov', messages };

  const low = ([t, v]: [number, number]) => expected.get(t)! > MIN_EXPECTED_KWH && v < LOW_RATIO * expected.get(t)!;
  let status: Status = hasError ? 'Alarm' : 'OK';
  if (recent.length === 3 && recent.every(low)) {
    messages.push('3 ure zapored pod pričakovano: potreben servis');
    status = 'Alarm';
  } else if (low(recent[0])) {
    messages.push(`Proizvodnja pod pričakovano: ${recent[0][1].toFixed(2)} kWh namesto ${expected.get(recent[0][0])!.toFixed(2)} kWh`);
    if (status === 'OK') status = 'Opozorilo';
  }
  return { status, messages };
}
