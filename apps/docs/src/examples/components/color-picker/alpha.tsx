import { createSignal } from 'solid-js';
import { ColorPicker, Group, Text } from '@solid-slopkit/components';

export default function Alpha() {
  const [color, setColor] = createSignal('rgba(224, 49, 49, 0.6)');

  return (
    <Group gap={6} align="flex-start">
      <ColorPicker label="Overlay" format="rgba" size="sm" value={color()} onChange={setColor} />
      <Text size="sm" style={{ 'font-family': 'var(--slp-font-family-monospace)', 'margin-top': '1.75rem' }}>
        {color()}
      </Text>
    </Group>
  );
}
