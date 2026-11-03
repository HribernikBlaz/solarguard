import { STOPS } from '../constants/heatmap-colors';

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));

export const indexAt = (times: number[], now: number) => Math.max(0, times.filter((t) => t <= now).length - 1);

export function color(v: number, max: number): string {
  const p = Math.min(1, Math.max(0, v / max));
  const k = Math.max(1, STOPS.findIndex(([s]) => s >= p));
  const [p0, c0] = STOPS[k - 1];
  const [p1, c1] = STOPS[k];
  const t = (p - p0) / (p1 - p0);

  return `rgb(${hex(c0).map((a, i) => Math.round(a + (hex(c1)[i] - a) * t)).join(',')})`;
}
