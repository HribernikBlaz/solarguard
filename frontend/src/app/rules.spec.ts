import { HOUR, evaluate, expectedKwh, productionSeries, sumByDay } from './rules';

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

  describe('productionSeries', () => {
    const at = (day: number, h: number) => new Date(2026, 10, day, h).getTime();
    const today = at(3, 15);
    const actual = new Map([[at(3, 12), 2], [at(3, 13), 3], [at(1, 12), 4]]);
    const expectedMap = new Map([[at(3, 12), 2.5], [at(3, 13), 3.5]]);

    it('shows the current day by hours with the forecast', () => {
      const s = productionSeries('dan', today, actual, expectedMap);
      expect(s.labels.length).toBe(24);
      expect(s.bars[12]).toBe(2);
      expect(s.bars[13]).toBe(3);
      expect(s.line[12]).toBe(2.5);
    });

    it('sums days in the week and month views', () => {
      const week = productionSeries('teden', today, actual, expectedMap);
      expect(week.bars.at(-1)).toBe(5);
      expect(week.bars.at(-3)).toBe(4);
      expect(productionSeries('mesec', today, actual, expectedMap).labels.length).toBe(30);
    });

    it('sums the year view by month and has no forecast line', () => {
      const s = productionSeries('leto', today, actual, expectedMap);
      expect(s.bars.at(-1)).toBe(9);
      expect(s.line).toEqual([]);
    });

    it('is empty when the period has no production', () => {
      expect(productionSeries('dan', at(10, 15), actual, expectedMap).labels).toEqual([]);
    });
  });
});
