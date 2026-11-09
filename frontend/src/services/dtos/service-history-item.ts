import { ServiceOrder } from './service-order';

export interface ServiceHistoryItem {
  orderId: string;
  status: ServiceOrder['status'];
  createdAt: string;
  closedAt: string | null;
  description: string;
  summary: string | null;
  technicianName: string | null;
}
