import { ServiceOrder } from '../../services/dtos/service-order';

export const ORDER_STATUS_LABELS: Record<ServiceOrder['status'], string> = {
  Open: 'Odprt',
  Assigned: 'Dodeljen',
  InProgress: 'V obdelavi',
  Completed: 'Zaključen',
};

export const NEXT_ORDER_STATUS: Partial<Record<ServiceOrder['status'], ServiceOrder['status']>> = {
  Open: 'Assigned',
  Assigned: 'InProgress',
  InProgress: 'Completed',
};
