import { createSignal, For } from 'solid-js';
import { Highlight, Stack, Text } from '@solid-slopkit/components';

const components = ['Badge', 'Blockquote', 'Button', 'Card', 'Code', 'Divider', 'Highlight', 'Kbd', 'List', 'Mark'];

export default function Search() {
  const [query, setQuery] = createSignal('co');

  return (
    <Stack gap={3} style={{ width: '100%' }}>
      <input
        aria-label="Search components"
        value={query()}
        onInput={(event) => setQuery(event.currentTarget.value)}
        style={{ 'max-width': '16rem' }}
      />
      <Stack gap={1}>
        <For each={components.filter((name) => name.toLowerCase().includes(query().trim().toLowerCase()))}>
          {(name) => (
            <Text>
              <Highlight highlight={query()}>{name}</Highlight>
            </Text>
          )}
        </For>
      </Stack>
    </Stack>
  );
}
