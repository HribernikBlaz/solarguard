export const STEP_LAT = 0.1;
export const STEP_LON = 0.14; // ~11 km celice

// shortcut: groba meja Slovenije (±5 km), samo za izbiro celic mreže; za natančno mejo uporabi GeoJSON
const BORDER: [number, number][] = [
  [46.23, 13.38], [46.4, 13.55], [46.5, 13.7], [46.52, 14.0], [46.47, 14.45], [46.6, 14.9], [46.65, 15.1], [46.67, 15.5],
  [46.7, 15.65], [46.68, 15.99], [46.86, 16.2], [46.84, 16.35], [46.7, 16.42], [46.55, 16.55], [46.47, 16.6], [46.4, 16.35],
  [46.38, 16.1], [46.3, 15.9], [46.23, 15.7], [46.1, 15.6], [45.9, 15.65], [45.8, 15.4], [45.64, 15.31], [45.48, 14.95],
  [45.42, 14.5], [45.55, 14.3], [45.52, 14.1], [45.45, 13.75], [45.53, 13.55], [45.62, 13.72], [45.66, 13.87], [45.8, 13.55],
  [45.94, 13.62], [46.1, 13.45],
];

export function insideSlovenia(lat: number, lon: number): boolean {
  let inside = false;
  for (let i = 0, j = BORDER.length - 1; i < BORDER.length; j = i++) {
    const [la1, lo1] = BORDER[i];
    const [la2, lo2] = BORDER[j];
    if (lo1 > lon !== lo2 > lon && lat < ((la2 - la1) * (lon - lo1)) / (lo2 - lo1) + la1) inside = !inside;
  }
  return inside;
}

export function gridPoints(): [number, number][] {
  const points: [number, number][] = [];
  for (let k = 0; 45.4 + k * STEP_LAT <= 46.9; k++) {
    for (let m = 0; 13.35 + m * STEP_LON <= 16.65; m++) {
      const lat = +(45.4 + k * STEP_LAT).toFixed(3);
      const lon = +(13.35 + m * STEP_LON).toFixed(3);
      if (insideSlovenia(lat, lon)) points.push([lat, lon]);
    }
  }
  return points;
}

const TOWNS: [string, number, number][] = [
  ['Ljubljana', 46.056, 14.505], ['Maribor', 46.554, 15.646], ['Celje', 46.23, 15.267], ['Kranj', 46.239, 14.356],
  ['Koper', 45.548, 13.73], ['Nova Gorica', 45.956, 13.648], ['Novo mesto', 45.804, 15.168], ['Murska Sobota', 46.662, 16.166],
  ['Ptuj', 46.42, 15.87], ['Kočevje', 45.643, 14.86], ['Postojna', 45.775, 14.215], ['Slovenj Gradec', 46.51, 15.08],
  ['Bled', 46.369, 14.114], ['Bovec', 46.337, 13.552], ['Krško', 45.959, 15.49],
];

export function nearestTown(lat: number, lon: number): string {
  const d = (t: [string, number, number]) => (t[1] - lat) ** 2 + ((t[2] - lon) * Math.cos((lat * Math.PI) / 180)) ** 2;
  return TOWNS.reduce((a, b) => (d(b) < d(a) ? b : a))[0];
}
