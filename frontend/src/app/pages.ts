export interface Field {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'checkbox' | 'select';
  options?: string[];
  ref?: { path: string; label: (r: any) => string };
}

export interface PageConfig {
  title: string;
  path: string;
  fields: Field[];
  sortBy?: string;
  detail?: string; // pot strani s podrobnostmi, doda povezavo v vrstici
  empty: () => Record<string, unknown>;
}

const installationRef = { path: 'installations', label: (r: any) => r.name };
const deviceRef = { path: 'devices', label: (r: any) => `${r.manufacturer} ${r.model} (${r.serialNumber})` };

export const INSTALLATIONS: PageConfig = {
  title: 'Sistemi',
  path: 'installations',
  detail: '/sistemi',
  fields: [
    { key: 'name', label: 'Naziv', type: 'text' },
    { key: 'address', label: 'Naslov', type: 'text' },
    { key: 'latitude', label: 'Lat', type: 'number' },
    { key: 'longitude', label: 'Lon', type: 'number' },
    { key: 'installationDate', label: 'Datum namestitve', type: 'date' },
    { key: 'ratedPowerKw', label: 'Nazivna moč (kW)', type: 'number' },
  ],
  empty: () => ({ name: '', address: '', latitude: 0, longitude: 0, installationDate: '', ratedPowerKw: 0 }),
};

export const DEVICES: PageConfig = {
  title: 'Naprave',
  path: 'devices',
  fields: [
    { key: 'installationId', label: 'Sistem', type: 'select', ref: installationRef },
    { key: 'type', label: 'Tip', type: 'select', options: ['Panel', 'Inverter'] },
    { key: 'manufacturer', label: 'Proizvajalec', type: 'text' },
    { key: 'model', label: 'Model', type: 'text' },
    { key: 'serialNumber', label: 'Serijska številka', type: 'text' },
    { key: 'warrantyUntil', label: 'Garancija do', type: 'date' },
  ],
  empty: () => ({ installationId: '', type: 'Panel', manufacturer: '', model: '', serialNumber: '', warrantyUntil: '' }),
};

export const MEASUREMENTS: PageConfig = {
  title: 'Meritve',
  path: 'measurements',
  sortBy: 'timestamp',
  fields: [
    { key: 'deviceId', label: 'Naprava', type: 'select', ref: deviceRef },
    { key: 'timestamp', label: 'Čas', type: 'datetime' },
    { key: 'productionKwh', label: 'Proizvodnja (kWh)', type: 'number' },
    { key: 'temperature', label: 'Temperatura (°C)', type: 'number' },
    { key: 'hasError', label: 'Napaka', type: 'checkbox' },
  ],
  empty: () => ({ deviceId: '', timestamp: new Date().toISOString(), productionKwh: 0, temperature: 0, hasError: false }),
};
