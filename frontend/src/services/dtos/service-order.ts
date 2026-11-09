export interface ServiceOrder {
  id: string;
  installationId: string;
  installationName: string;
  installationAddress: string;
  deviceType: 'Panel' | 'Inverter';
  serialNumber: string;
  severity: 'Warning' | 'Critical';
  description: string;
  status: 'Open' | 'Assigned' | 'InProgress' | 'Completed';
  assigneeId: string | null;
  assigneeName: string | null;
  createdAt: string;
  closedAt: string | null;
  summary: string | null;
  isAssignedToMe: boolean;
}
