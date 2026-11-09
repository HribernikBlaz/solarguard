export interface ForecastDay {
  date: string;
  expectedKwh: number;
  cloudPercent: number | null;
  grade: 'Weak' | 'Normal' | 'Good';
}

export interface Forecast {
  days: ForecastDay[];
  baselineKwh: number;
  warning: string | null;
}
