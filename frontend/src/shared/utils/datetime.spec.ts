import { fromLocalInput, toLocalInput } from './datetime';

describe('datetime', () => {
  it('round-trips a UTC timestamp through the local input format', () => {
    expect(fromLocalInput(toLocalInput('2026-10-15T10:30:00.000Z'))).toBe('2026-10-15T10:30:00.000Z');
  });
});
