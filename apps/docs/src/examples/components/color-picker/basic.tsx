import { createSignal } from 'solid-js';
import { ColorPicker, Group, Text } from '@solid-slopkit/components';

export default function Basic() {
  const [color, setColor] = createSignal('#1971c2');

  return (
    <Group gap={6} align="flex-start">
      <ColorPicker
        label="Brand color"
        value={color()}
        onChange={setColor}
        swatches={['#e03131', '#f08c00', '#2f9e44', '#1971c2', '#7048e8', '#212529', '#ffffff']}
      />
      <Text size="sm" style={{ 'font-family': 'var(--slp-font-family-monospace)', 'margin-top': '1.75rem' }}>
        {color()}
      </Text>
    </Group>
  );
}
