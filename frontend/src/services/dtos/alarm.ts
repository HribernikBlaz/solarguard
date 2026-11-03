export interface Alarm {
  id: string;
  installationId: string;
  installationName: string;
  deviceId: string;
  deviceType: 'Panel' | 'Inverter';
  serialNumber: string;
  type: 'LowProduction' | 'MissingMeasurements';
  severity: 'Warning' | 'Critical';
  status: 'Active' | 'Resolved';
  detectedAt: string;
  resolvedAt: string | null;
  description: string;
}
