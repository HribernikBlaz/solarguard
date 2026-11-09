export interface OrderCounts {
  open: number;
  assigned: number;
  inProgress: number;
  completed: number;
}

export interface AdminInstallation {
  id: string;
  name: string;
  address: string;
  ratedPowerKw: number;
  ownerName: string | null;
  ownerEmail: string | null;
  deviceCount: number;
  lastMeasurementAt: string | null;
  openOrders: number;
  active: boolean;
}

export interface AdminOverview {
  installations: number;
  devices: number;
  users: number;
  activeUsers: number;
  orders: OrderCounts;
  systems: AdminInstallation[];
}
