export function dayKey(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');

  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function sumByDay(entries: Iterable<[number, number]>): Map<string, number> {
  const days = new Map<string, number>();
  for (const [t, v] of entries) {
    days.set(dayKey(t), (days.get(dayKey(t)) ?? 0) + v);
  }

  return days;
}
