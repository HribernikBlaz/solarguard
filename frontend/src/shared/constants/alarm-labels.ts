import { Alarm } from '../../services/dtos/alarm';

export const SEVERITY_LABELS: Record<Alarm['severity'], string> = {
  Warning: 'Opozorilo',
  Critical: 'Kritično',
};

export const STATUS_LABELS: Record<Alarm['status'], string> = {
  Active: 'Aktiven',
  Resolved: 'Razrešen',
};
