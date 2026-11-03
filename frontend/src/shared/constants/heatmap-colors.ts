export const STOPS: [number, string][] = [
  [0, '#3b4a8a'],
  [0.25, '#2f9fb0'],
  [0.5, '#f2d64b'],
  [0.75, '#f08a24'],
  [1, '#c6372c'],
];

export const GRADIENT = `linear-gradient(to right, ${STOPS.map(([p, c]) => `${c} ${p * 100}%`).join(', ')})`;
