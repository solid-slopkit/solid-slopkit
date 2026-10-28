import { For } from 'solid-js';
import { ColorSwatch, Group, Text } from '@solid-slopkit/components';

const colors = [
  { name: 'Grape', value: '#7048e8' },
  { name: 'Teal', value: '#0c8599' },
  { name: 'Orange', value: '#f76707' },
  { name: 'White', value: '#ffffff' },
  { name: 'Black at 40%', value: 'rgb(0 0 0 / 40%)' },
];

export default function Basic() {
  return (
    <For each={colors}>
      {(color) => (
        <Group gap={2}>
          <ColorSwatch value={color.value} />
          <Text as="span" size="sm">
            {color.name}
          </Text>
        </Group>
      )}
    </For>
  );
}
