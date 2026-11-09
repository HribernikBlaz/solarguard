import { ForecastDay } from '../../services/dtos/forecast';

export const FORECAST_GRADES: Record<ForecastDay['grade'], { text: string; tone: string }> = {
  Weak: { text: 'šibek', tone: 'weak' },
  Normal: { text: 'običajen', tone: '' },
  Good: { text: 'odličen', tone: 'good' },
};
