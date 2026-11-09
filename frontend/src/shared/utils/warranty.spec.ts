import { warrantyStatus } from './warranty';

const today = new Date(2026, 10, 9);

describe('warrantyStatus', () => {
  it('is valid when there are more than 30 days left', () => {
    expect(warrantyStatus('2026-12-10', today)).toEqual({ state: 'valid', daysLeft: 31 });
  });

  it('is expiring from 30 days before the end, including the last day', () => {
    expect(warrantyStatus('2026-12-09', today)).toEqual({ state: 'expiring', daysLeft: 30 });
    expect(warrantyStatus('2026-11-09', today)).toEqual({ state: 'expiring', daysLeft: 0 });
  });

  it('is expired the day after the end', () => {
    expect(warrantyStatus('2026-11-08', today)).toEqual({ state: 'expired', daysLeft: -1 });
  });
});
