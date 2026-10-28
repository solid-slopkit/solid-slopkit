import { createSignal } from 'solid-js';
import { NumberInput, Text } from '@solid-slopkit/components';

export default function Basic() {
  const [quantity, setQuantity] = createSignal<number | undefined>(1);

  return (
    <div style={{ width: '100%', 'max-width': '16rem' }}>
      <NumberInput label="Quantity" description="From 1 to 99." value={quantity()} onChange={setQuantity} min={1} max={99} />
      <Text size="sm" dimmed style={{ 'margin-top': '0.5rem' }}>
        Value: {quantity() ?? 'empty'}
      </Text>
    </div>
  );
}
