export const TABS = [
  ['naprave', 'Naprave'],
  ['meritve', 'Meritve'],
  ['napoved', 'Napoved'],
  ['alarmi', 'Alarmi'],
  ['nalogi', 'Servisni nalogi'],
] as const;

export const TECHNICIAN_TABS: readonly (typeof TABS)[number][0][] = ['naprave', 'nalogi'];
