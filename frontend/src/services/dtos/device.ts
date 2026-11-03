export interface Device {
  id: string;
  installationId: string;
  type: 'Panel' | 'Inverter';
  manufacturer: string;
  model: string;
  serialNumber: string;
  installedOn: string;
  warrantyUntil: string;
}
