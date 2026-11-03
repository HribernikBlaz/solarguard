export interface Field {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'checkbox' | 'select';
  options?: string[];
  ref?: { path: string; label: (r: any) => string };
}
