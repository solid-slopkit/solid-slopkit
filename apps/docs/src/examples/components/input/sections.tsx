import { createSignal, Show } from 'solid-js';
import { Search } from '@lucide/solid';
import { CloseButton, Input, Stack } from '@solid-slopkit/components';

export default function Sections() {
  const [query, setQuery] = createSignal('');

  return (
    <Stack gap={3} style={{ width: '100%', 'max-width': '20rem' }}>
      <Input
        aria-label="Search"
        placeholder="Search…"
        value={query()}
        onInput={(event) => setQuery(event.currentTarget.value)}
        leftSection={<Search aria-hidden="true" />}
        rightSection={
          <Show when={query()}>
            <CloseButton size="xs" label="Clear the search" onClick={() => setQuery('')} />
          </Show>
        }
      />
      <Input aria-label="Price" type="number" placeholder="0.00" rightSection={<span>USD</span>} />
    </Stack>
  );
}
