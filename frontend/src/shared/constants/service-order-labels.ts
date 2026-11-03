import { ServiceOrder } from '../../services/dtos/service-order';

export const ORDER_STATUS_LABELS: Record<ServiceOrder['status'], string> = {
  Open: 'Odprt',
  Assigned: 'Dodeljen',
  InProgress: 'V obdelavi',
  Completed: 'Zaključen',
};
