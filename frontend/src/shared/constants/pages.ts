import { PageConfig } from '../models/page-config';
import { warrantyStatus } from '../utils/warranty';
import { ROLES } from './roles';

const installationRef = { path: 'installations', label: (r: any) => r.name };
const technicianRef = { path: 'technicians', label: (r: any) => r.name };
const deviceRef = { path: 'devices', label: (r: any) => `${r.manufacturer} ${r.model} (${r.serialNumber})` };

export const INSTALLATIONS: PageConfig = {
  title: 'Sistemi',
  itemName: 'sistem',
  path: 'installations',
  detail: '/sistemi',
  writeRoles: [ROLES.owner, ROLES.admin],
  fields: [
    { key: 'name', label: 'Naziv', type: 'text' },
    { key: 'address', label: 'Naslov', type: 'text' },
    { key: 'latitude', label: 'Lat', type: 'number' },
    { key: 'longitude', label: 'Lon', type: 'number' },
    { key: 'installationDate', label: 'Datum namestitve', type: 'date' },
    { key: 'ratedPowerKw', label: 'Nazivna moč (kW)', type: 'number' },
    { key: 'electricityPrice', label: 'Cena elektrike (€/kWh)', type: 'number', optional: true, hiddenFor: [ROLES.technician] },
    { key: 'technicianId', label: 'Serviser', type: 'select', ref: technicianRef, optional: true, adminOnly: true },
  ],
  empty: () => ({ name: '', address: '', latitude: 0, longitude: 0, installationDate: '', ratedPowerKw: 0, electricityPrice: null, technicianId: null }),
};

export const DEVICES: PageConfig = {
  title: 'Naprave',
  itemName: 'napravo',
  path: 'devices',
  sortBy: 'installedOn',
  writeRoles: [ROLES.owner, ROLES.admin],
  filters: [
    {
      id: 'type',
      label: 'Tip',
      options: [
        { value: 'Panel', label: 'Panel' },
        { value: 'Inverter', label: 'Inverter' },
      ],
      match: (row, value) => row['type'] === value,
    },
    {
      id: 'warranty',
      label: 'Garancija',
      options: [
        { value: 'valid', label: 'Veljavna' },
        { value: 'expiring', label: 'Poteče v 30 dneh' },
        { value: 'expired', label: 'Potekla' },
      ],
      match: (row, value) => warrantyStatus(row['warrantyUntil']).state === value,
    },
  ],
  fields: [
    { key: 'installationId', label: 'Sistem', type: 'select', ref: installationRef },
    { key: 'type', label: 'Tip', type: 'select', options: ['Panel', 'Inverter'] },
    { key: 'manufacturer', label: 'Proizvajalec', type: 'text' },
    { key: 'model', label: 'Model', type: 'text' },
    { key: 'serialNumber', label: 'Serijska številka', type: 'text' },
    { key: 'installedOn', label: 'Datum namestitve', type: 'date' },
    { key: 'warrantyUntil', label: 'Garancija do', type: 'date', badge: 'warranty' },
  ],
  empty: () => ({ installationId: '', type: 'Panel', manufacturer: '', model: '', serialNumber: '', installedOn: '', warrantyUntil: '' }),
};

export const MEASUREMENTS: PageConfig = {
  title: 'Meritve',
  itemName: 'meritev',
  path: 'measurements',
  sortBy: 'timestamp',
  writeRoles: [ROLES.admin],
  fields: [
    { key: 'deviceId', label: 'Naprava', type: 'select', ref: deviceRef },
    { key: 'timestamp', label: 'Čas', type: 'datetime' },
    { key: 'productionKwh', label: 'Proizvodnja (kWh)', type: 'number' },
    { key: 'temperature', label: 'Temperatura (°C)', type: 'number' },
    { key: 'hasError', label: 'Napaka', type: 'checkbox' },
  ],
  empty: () => ({ deviceId: '', timestamp: new Date().toISOString(), productionKwh: 0, temperature: 0, hasError: false }),
};
