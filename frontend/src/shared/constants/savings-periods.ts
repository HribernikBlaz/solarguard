export type SavingsPeriod = 'day' | 'month' | 'year';

export const SAVINGS_PERIODS: { key: SavingsPeriod; label: string; title: string }[] = [
  { key: 'day', label: 'Dan', title: 'Danes' },
  { key: 'month', label: 'Mesec', title: 'Ta mesec' },
  { key: 'year', label: 'Leto', title: 'To leto' },
];
