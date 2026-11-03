import { sumByDay } from './day';

const HOUR = 3_600_000;

describe('sumByDay', () => {
  it('sums by day', () => {
    const noon = new Date(2026, 9, 22, 12).getTime();
    expect([...sumByDay([[noon, 1], [noon + HOUR, 2]]).values()]).toEqual([3]);
  });
});
