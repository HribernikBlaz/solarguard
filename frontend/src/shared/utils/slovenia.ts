import { BORDER, STEP_LAT, STEP_LON, TOWNS } from '../constants/slovenia';

export function insideSlovenia(lat: number, lon: number): boolean {
  let inside = false;
  for (let i = 0, j = BORDER.length - 1; i < BORDER.length; j = i++) {
    const [la1, lo1] = BORDER[i];
    const [la2, lo2] = BORDER[j];
    if (lo1 > lon !== lo2 > lon && lat < ((la2 - la1) * (lon - lo1)) / (lo2 - lo1) + la1) {
      inside = !inside;
    }
  }

  return inside;
}

export function gridPoints(): [number, number][] {
  const points: [number, number][] = [];
  for (let k = 0; 45.4 + k * STEP_LAT <= 46.9; k++) {
    for (let m = 0; 13.35 + m * STEP_LON <= 16.65; m++) {
      const lat = +(45.4 + k * STEP_LAT).toFixed(3);
      const lon = +(13.35 + m * STEP_LON).toFixed(3);
      if (insideSlovenia(lat, lon)) {
        points.push([lat, lon]);
      }
    }
  }

  return points;
}

export function nearestTown(lat: number, lon: number): string {
  const d = (t: [string, number, number]) => (t[1] - lat) ** 2 + ((t[2] - lon) * Math.cos((lat * Math.PI) / 180)) ** 2;

  return TOWNS.reduce((a, b) => (d(b) < d(a) ? b : a))[0];
}
