import { Field } from './field';

export interface PageConfig {
  title: string;
  itemName: string;
  path: string;
  fields: Field[];
  sortBy?: string;
  filter?: { key: string; label: string; options: string[] };
  detail?: string;
  writeRoles: string[];
  empty: () => Record<string, unknown>;
}
