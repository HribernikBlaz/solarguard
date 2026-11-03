export interface Measurement {
  id: string;
  deviceId: string;
  timestamp: string;
  productionKwh: number;
  temperature: number;
  hasError: boolean;
}
