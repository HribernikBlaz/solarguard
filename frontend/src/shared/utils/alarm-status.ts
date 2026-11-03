import { Alarm } from '../../services/dtos/alarm';
import { Evaluation } from '../models/evaluation';

export function alarmStatus(alarms: Alarm[]): Evaluation {
  const active = alarms.filter((a) => a.status === 'Active');
  const messages = active.map((a) => a.description);
  if (active.some((a) => a.severity === 'Critical')) {
    return { status: 'Alarm', messages };
  }
  if (active.length > 0) {
    return { status: 'Opozorilo', messages };
  }

  return { status: 'OK', messages };
}
