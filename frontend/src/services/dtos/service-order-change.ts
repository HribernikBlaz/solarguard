import { ServiceOrder } from './service-order';

export interface ServiceOrderChange {
  status: ServiceOrder['status'];
  changedAt: string;
  changedByName: string;
}
