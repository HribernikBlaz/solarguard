import { Notification } from '../../services/dtos/notification';

export const NOTIFICATION_KIND_LABELS: Record<Notification['kind'], string> = {
  CriticalAlarm: 'Kritični alarm',
  ServiceOrderAssigned: 'Servisni nalog',
  ProductionMilestone: 'Mejnik proizvodnje',
  WarrantyExpiring: 'Garancija',
};

export const EMAIL_STATUS_LABELS: Record<Notification['emailStatus'], string> = {
  Pending: 'Se pošilja',
  Sent: 'Poslana',
  Failed: 'Ni dostavljena',
};

// Vrednosti za data-status značke: Pending je nevtralen, zato ga ni.
export const EMAIL_STATUS_TONES: Record<Notification['emailStatus'], string | null> = {
  Pending: null,
  Sent: 'OK',
  Failed: 'Alarm',
};
