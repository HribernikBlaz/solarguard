import { Evaluation } from '../../shared/models/evaluation';
import { Device } from './device';
import { Installation } from './installation';
import { Measurement } from './measurement';

export interface Overview {
  inst: Installation;
  devices: Device[];
  measurements: Measurement[];
  actual: Map<number, number>;
  result: Evaluation;
}
