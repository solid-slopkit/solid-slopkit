import { createSignal } from 'solid-js';
import { Autocomplete, Stack, Text } from '@solid-slopkit/components';

export default function Groups() {
  const [ingredient, setIngredient] = createSignal('');

  return (
    <Stack style={{ width: '16rem' }}>
      <Autocomplete
        label="Ingredient"
        description="Any text works; suggestions help"
        placeholder="Start typing"
        limit={6}
        value={ingredient()}
        onChange={setIngredient}
        data={[
          { group: 'Fruit', items: ['Apple', 'Apricot', 'Banana', 'Blackberry', 'Cherry'] },
          { group: 'Vegetables', items: ['Carrot', 'Celery', { value: 'Chard', disabled: true }, 'Leek', 'Lettuce'] },
        ]}
      />
      <Text size="sm">Value: {ingredient() || 'empty'}</Text>
    </Stack>
  );
}
