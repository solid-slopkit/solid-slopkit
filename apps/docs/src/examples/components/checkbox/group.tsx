import { createSignal } from 'solid-js';
import { Checkbox, Group, Text } from '@solid-slopkit/components';

export default function CheckboxGroupExample() {
  const [toppings, setToppings] = createSignal<string[]>(['cheese']);

  return (
    <div>
      <Checkbox.Group label="Toppings" description="Pick as many as you like." value={toppings()} onChange={setToppings}>
        <Group gap={4} style={{ 'margin-top': '0.25rem' }}>
          <Checkbox value="cheese" label="Cheese" />
          <Checkbox value="olives" label="Olives" />
          <Checkbox value="peppers" label="Peppers" />
        </Group>
      </Checkbox.Group>
      <Text size="sm" dimmed style={{ 'margin-top': '0.5rem' }}>
        Value: [{toppings().join(', ')}]
      </Text>
    </div>
  );
}
