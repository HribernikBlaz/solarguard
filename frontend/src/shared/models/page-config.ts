import { Field } from './field';

export interface PageFilter {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  match: (row: Record<string, any>, value: string) => boolean;
}

export interface PageConfig {
  title: string;
  itemName: string;
  path: string;
  fields: Field[];
  sortBy?: string;
  filters?: PageFilter[];
  detail?: string;
  writeRoles: string[];
  empty: () => Record<string, unknown>;
}
