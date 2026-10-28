import { createSignal, For } from 'solid-js';
import { Chip, Text } from '@solid-slopkit/components';

const filters = ['Vegan', 'Gluten free', 'Spicy', 'Nut free', 'Under 30 minutes'];

export default function Multiple() {
  const [chosen, setChosen] = createSignal<string[]>(['Vegan']);

  return (
    <div>
      <Chip.Group multiple aria-label="Filters" value={chosen()} onChange={setChosen}>
        <For each={filters}>{(filter) => <Chip value={filter}>{filter}</Chip>}</For>
      </Chip.Group>
      <Text size="sm" dimmed style={{ 'margin-top': '0.5rem' }}>
        Value: [{chosen().join(', ')}]
      </Text>
    </div>
  );
}
