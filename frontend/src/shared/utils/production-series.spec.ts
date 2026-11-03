import { productionSeries } from './production-series';

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
