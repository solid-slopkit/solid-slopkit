import { createSignal, For } from 'solid-js';
import { Checkbox, Stack } from '@solid-slopkit/components';

const items = ['Receipts', 'Invoices', 'Statements'];

export default function Indeterminate() {
  const [checked, setChecked] = createSignal<string[]>(['Receipts']);
  const all = () => checked().length === items.length;
  const some = () => checked().length > 0 && !all();

  return (
    <Stack gap={2}>
      <Checkbox
        label="All documents"
        checked={all()}
        indeterminate={some()}
        onChange={(on) => setChecked(on ? [...items] : [])}
      />
      <Stack gap={2} style={{ 'padding-inline-start': '1.75rem' }}>
        <For each={items}>
          {(item) => (
            <Checkbox
              label={item}
              checked={checked().includes(item)}
              onChange={(on) => setChecked((list) => (on ? [...list, item] : list.filter((entry) => entry !== item)))}
            />
          )}
        </For>
      </Stack>
    </Stack>
  );
}
