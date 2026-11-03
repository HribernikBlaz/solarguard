import { Evaluation } from '../../shared/models/evaluation';
import { Device } from './device';
import { Installation } from './installation';
import { Measurement } from './measurement';
import { Weather } from './weather';

export interface Overview {
  inst: Installation;
  devices: Device[];
  measurements: Measurement[];
  weather: Weather | null;
  expected: Map<number, number>;
  actual: Map<number, number>;
  result: Evaluation;
}
