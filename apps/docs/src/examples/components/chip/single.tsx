import { createSignal } from 'solid-js';
import { Chip, Text } from '@solid-slopkit/components';

export default function Single() {
  const [size, setSize] = createSignal('m');

  return (
    <div>
      <Chip.Group label="Size" value={size()} onChange={setSize}>
        <Chip value="s">Small</Chip>
        <Chip value="m">Medium</Chip>
        <Chip value="l">Large</Chip>
        <Chip value="xl" disabled>
          Extra large
        </Chip>
      </Chip.Group>
      <Text size="sm" dimmed style={{ 'margin-top': '0.5rem' }}>
        Value: {size()}
      </Text>
    </div>
  );
}
