import { createSignal } from 'solid-js';
import { RangeSlider, Text } from '@solid-slopkit/components';

export default function Basic() {
  const [price, setPrice] = createSignal<[number, number]>([20, 80]);

  return (
    <div style={{ width: '100%', 'max-width': '24rem' }}>
      <RangeSlider label="Price" value={price()} onChange={setPrice} valueLabel={(value) => `$${value}`} />
      <Text size="sm" dimmed style={{ 'margin-top': '0.5rem' }}>
        From ${price()[0]} to ${price()[1]}
      </Text>
    </div>
  );
}
