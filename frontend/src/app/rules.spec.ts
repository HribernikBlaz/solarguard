import { HOUR, evaluate, expectedKwh, sumByDay } from './rules';

describe('rules', () => {
  const now = Date.UTC(2026, 9, 22, 12, 30);
  const hour = (n: number) => Date.UTC(2026, 9, 22, 12) - n * HOUR;
  const expected = new Map([0, 1, 2].map((n) => [hour(n), 1] as [number, number]));
  const actual = (...v: number[]) => new Map(v.map((x, n) => [hour(n), x] as [number, number]));

  it('computes expected kWh from irradiance', () => {
    expect(expectedKwh(1000, 5)).toBeCloseTo(4);
  });

  it('is OK when production matches the forecast', () => {
    expect(evaluate(expected, actual(1, 1, 1), now, false).status).toBe('OK');
  });

  it('warns when the last hour is under 60% of expected', () => {
    expect(evaluate(expected, actual(0.3, 1, 1), now, false).status).toBe('Opozorilo');
  });

  it('raises an alarm after 3 low hours or a device error', () => {
    expect(evaluate(expected, actual(0.3, 0.3, 0.3), now, false).status).toBe('Alarm');
    expect(evaluate(expected, actual(1, 1, 1), now, true).messages).toEqual(['Naprava javlja napako']);
  });

  it('reports missing data when measurements are stale', () => {
    expect(evaluate(expected, actual(1, 1, 1), now + 8 * HOUR, false).status).toBe('Ni podatkov');
  });

  it('sums by day', () => {
    const noon = new Date(2026, 9, 22, 12).getTime();
    expect([...sumByDay([[noon, 1], [noon + HOUR, 2]]).values()]).toEqual([3]);
  });
});
