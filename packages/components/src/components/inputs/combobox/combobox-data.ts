// The options of the fields built on Combobox (Select, Autocomplete, …): strings, items and groups, and their
// normalized form. Internal; each field exports its own names for these types.

/** An option: its value, and the label shown for it (the value when there's none). */
export interface ComboboxItem {
  value: string;
  label?: string;
  disabled?: boolean;
}

/** Options under a heading. */
export interface ComboboxGroup<Item = string | ComboboxItem> {
  group: string;
  items: readonly Item[];
}

/** Strings, items, and groups of them, in the order they're shown. */
export type ComboboxData<Item = string | ComboboxItem> = readonly (Item | ComboboxGroup<Item>)[];

export interface NormalizedGroup {
  /** The heading; none for the loose options before the first group. */
  group?: string;
  items: Required<ComboboxItem>[];
}

const toItem = (entry: string | ComboboxItem): Required<ComboboxItem> =>
  typeof entry === 'string'
    ? { value: entry, label: entry, disabled: false }
    : { value: entry.value, label: entry.label ?? entry.value, disabled: !!entry.disabled };

/** The data as groups, with loose options gathered into groups without a heading. */
export function normalizeData(data: ComboboxData): NormalizedGroup[] {
  const groups: NormalizedGroup[] = [];
  for (const entry of data) {
    if (typeof entry !== 'string' && 'group' in entry) {
      groups.push({ group: entry.group, items: entry.items.map(toItem) });
    } else {
      const last = groups.at(-1);
      if (last && last.group === undefined) last.items.push(toItem(entry));
      else groups.push({ items: [toItem(entry)] });
    }
  }
  return groups;
}

/** The groups with only the items whose label contains `search` (ignoring case), and without empty groups. */
export function filterGroups(groups: NormalizedGroup[], search: string): NormalizedGroup[] {
  const needle = search.trim().toLocaleLowerCase();
  if (!needle) return groups;
  return groups
    .map((group) => ({ ...group, items: group.items.filter((item) => item.label.toLocaleLowerCase().includes(needle)) }))
    .filter((group) => group.items.length > 0);
}
