import { ROLES } from './roles';

export interface MenuItem {
  path: string;
  label: string;
  roles: string[];
  section: 'main' | 'data';
}

const { owner, technician, admin } = ROLES;

export const MENU: MenuItem[] = [
  { path: '/', label: 'Dashboard', roles: [owner, admin], section: 'main' },
  { path: '/pregled-platforme', label: 'Pregled platforme', roles: [admin], section: 'main' },
  { path: '/zemljevid', label: 'Zemljevid', roles: [owner, admin], section: 'main' },
  { path: '/toplotna-karta', label: 'Toplotna karta', roles: [owner, admin], section: 'main' },
  { path: '/napoved', label: 'Napoved', roles: [owner, admin], section: 'main' },
  { path: '/sistemi', label: 'Moji sistemi', roles: [owner], section: 'main' },
  { path: '/sistemi', label: 'Sistemi', roles: [admin, technician], section: 'main' },
  { path: '/alarmi', label: 'Alarmi', roles: [owner, admin], section: 'main' },
  { path: '/obvestila', label: 'Obvestila', roles: [owner, technician, admin], section: 'main' },
  { path: '/servisni-nalogi', label: 'Servisni nalogi', roles: [owner, technician, admin], section: 'main' },
  { path: '/porocila', label: 'Poročila', roles: [owner, admin], section: 'main' },
  { path: '/nastavitve', label: 'Nastavitve', roles: [owner, admin], section: 'main' },
  { path: '/naprave', label: 'Naprave', roles: [owner, technician, admin], section: 'data' },
  { path: '/meritve', label: 'Meritve', roles: [admin], section: 'data' },
];

export function menuFor(role: string | undefined, section: MenuItem['section']) {
  return MENU.filter((m) => m.section === section && !!role && m.roles.includes(role));
}
