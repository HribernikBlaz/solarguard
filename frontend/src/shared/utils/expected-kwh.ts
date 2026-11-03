import { PR } from '../constants/production-rules';

export const expectedKwh = (gtiWm2: number, ratedKw: number) => (gtiWm2 / 1000) * ratedKw * PR;
