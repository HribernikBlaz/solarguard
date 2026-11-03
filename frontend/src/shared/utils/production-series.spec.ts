import { ProductionComparison } from '../../services/dtos/production-comparison';
import { productionSeries } from './production-series';

describe('productionSeries', () => {
  const comparison = (period: ProductionComparison['period'], points: ProductionComparison['points']): ProductionComparison => ({
    period,
    points,
    deviationPercent: null,
    warning: null,
  });

  it('labels hours of the day in Slovenian time and keeps the forecast line', () => {
    const s = productionSeries(
      comparison('dan', [
        { start: '2026-11-03T12:00:00Z', actualKwh: 2, expectedKwh: 2.5 },
        { start: '2026-11-03T13:00:00Z', actualKwh: 3, expectedKwh: 3.5 },
      ]),
    );
    expect(s.labels).toEqual(['13:00', '14:00']);
    expect(s.bars).toEqual([2, 3]);
    expect(s.line).toEqual([2.5, 3.5]);
  });

  it('labels days by local date', () => {
    const s = productionSeries(comparison('teden', [{ start: '2026-10-27T23:00:00Z', actualKwh: 4, expectedKwh: 1 }]));
    expect(s.labels).toEqual(['28.10.']);
  });

  it('has no forecast line when no point has an expected value', () => {
    const s = productionSeries(comparison('leto', [{ start: '2026-09-30T22:00:00Z', actualKwh: 9, expectedKwh: null }]));
    expect(s.bars).toEqual([9]);
    expect(s.line).toEqual([]);
  });

  it('is empty when the period has no production', () => {
    const s = productionSeries(comparison('dan', [{ start: '2026-11-03T12:00:00Z', actualKwh: 0, expectedKwh: 0 }]));
    expect(s.labels).toEqual([]);
  });
});
