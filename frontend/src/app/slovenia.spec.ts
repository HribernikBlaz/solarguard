import { gridPoints, insideSlovenia, nearestTown } from './slovenia';

describe('slovenia', () => {
  it('contains Slovenian towns and excludes neighbouring capitals', () => {
    for (const [lat, lon] of [[46.056, 14.505], [46.554, 15.646], [45.548, 13.73], [46.662, 16.166]]) expect(insideSlovenia(lat, lon)).toBe(true);
    for (const [lat, lon] of [[47.07, 15.44], [45.815, 15.98], [48.2, 16.37]]) expect(insideSlovenia(lat, lon)).toBe(false);
  });

  it('builds a grid small enough for one Open-Meteo request', () => {
    const n = gridPoints().length;
    expect(n).toBeGreaterThan(100);
    expect(n).toBeLessThan(300);
  });

  it('names the nearest town', () => {
    expect(nearestTown(46.06, 14.5)).toBe('Ljubljana');
    expect(nearestTown(45.5, 13.7)).toBe('Koper');
  });
});
