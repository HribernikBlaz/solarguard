import { menuFor } from './menu';
import { ROLES } from './roles';

const labels = (role: string) => [...menuFor(role, 'main'), ...menuFor(role, 'data')].map((m) => m.label);

describe('menuFor', () => {
  it('gives the technician only systems, notifications, service orders and devices', () => {
    expect(labels(ROLES.technician)).toEqual(['Sistemi', 'Obvestila', 'Servisni nalogi', 'Naprave']);
  });

  it('hides the measurements from the owner', () => {
    expect(labels(ROLES.owner)).toContain('Moji sistemi');
    expect(labels(ROLES.owner)).not.toContain('Meritve');
  });

  it('shows the admin everything under the name Sistemi', () => {
    expect(labels(ROLES.admin)).toContain('Meritve');
    expect(labels(ROLES.admin)).toContain('Sistemi');
    expect(labels(ROLES.admin)).not.toContain('Moji sistemi');
  });

  it('shows nothing without a role', () => {
    expect(labels('')).toEqual([]);
  });
});
