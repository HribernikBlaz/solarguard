import { Period } from '../../shared/models/period';
import { ProductionPoint } from './production-point';

export interface ProductionComparison {
  period: Period;
  points: ProductionPoint[];
  deviationPercent: number | null;
  warning: string | null;
}
