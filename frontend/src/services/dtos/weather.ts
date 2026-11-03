export interface Weather {
  interval: number;
  hours: { t: number; gti: number; cloud: number }[];
}
