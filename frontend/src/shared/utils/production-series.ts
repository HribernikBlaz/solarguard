import { DAY_FORMAT, HOUR_FORMAT, MONTH_NAME_FORMAT, MONTH_NUMBER_FORMAT, TITLE_FORMAT } from '../constants/production-periods';
import { ProductionComparison } from '../../services/dtos/production-comparison';
import { Period } from '../models/period';
import { Series } from '../models/series';

function part(format: Intl.DateTimeFormat, type: Intl.DateTimeFormatPartTypes, date: Date): string {
  return format.formatToParts(date).find((p) => p.type === type)!.value.replace(/\D/g, '');
}

function slotLabel(period: Period, start: Date): string {
  if (period === 'dan') {
    return `${part(HOUR_FORMAT, 'hour', start)}:00`;
  }
  if (period === 'leto') {
    return MONTH_NAME_FORMAT.format(start);
  }

  return `${part(DAY_FORMAT, 'day', start)}.${part(MONTH_NUMBER_FORMAT, 'month', start)}.`;
}

export function productionSeries(comparison: ProductionComparison): Series {
  const { period, points } = comparison;
  if (points.every((p) => p.actualKwh === 0)) {
    return { labels: [], titles: [], bars: [], line: [] };
  }

  const hasExpected = points.some((p) => p.expectedKwh !== null);

  return {
    labels: points.map((p) => slotLabel(period, new Date(p.start))),
    titles: points.map((p) => TITLE_FORMAT[period].format(new Date(p.start))),
    bars: points.map((p) => p.actualKwh),
    line: hasExpected ? points.map((p) => p.expectedKwh ?? 0) : [],
  };
}
