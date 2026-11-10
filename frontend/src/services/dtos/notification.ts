export interface Notification {
  id: string;
  kind: 'WarrantyExpiring' | 'CriticalAlarm' | 'ServiceOrderAssigned' | 'ProductionMilestone';
  message: string;
  createdAt: string;
  emailStatus: 'Pending' | 'Sent' | 'Failed';
}
