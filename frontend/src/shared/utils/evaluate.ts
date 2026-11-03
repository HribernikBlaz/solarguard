import { HOUR, LOW_RATIO, MIN_EXPECTED_KWH } from '../constants/production-rules';
import { Evaluation } from '../models/evaluation';
import { Status } from '../models/status';

export function evaluate(expected: Map<number, number>, actual: Map<number, number>, now: number, hasError: boolean): Evaluation {
  const messages = hasError ? ['Naprava javlja napako'] : [];
  const recent = [...actual].filter(([t]) => t <= now && expected.has(t)).sort((a, b) => b[0] - a[0]).slice(0, 3);
  if (!recent.length || now - recent[0][0] > 3 * HOUR) {
    return { status: hasError ? 'Alarm' : 'Ni podatkov', messages };
  }

  const low = ([t, v]: [number, number]) => expected.get(t)! > MIN_EXPECTED_KWH && v < LOW_RATIO * expected.get(t)!;
  let status: Status = hasError ? 'Alarm' : 'OK';
  if (recent.length === 3 && recent.every(low)) {
    messages.push('3 ure zapored pod pričakovano: potreben servis');
    status = 'Alarm';
  } else if (low(recent[0])) {
    messages.push(`Proizvodnja pod pričakovano: ${recent[0][1].toFixed(2)} kWh namesto ${expected.get(recent[0][0])!.toFixed(2)} kWh`);
    if (status === 'OK') {
      status = 'Opozorilo';
    }
  }

  return { status, messages };
}
