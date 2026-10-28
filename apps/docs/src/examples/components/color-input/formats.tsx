import { createSignal } from 'solid-js';
import { ColorInput, Stack, Text } from '@solid-slopkit/components';

export default function Formats() {
  const [color, setColor] = createSignal('rgba(25, 113, 194, 0.6)');

  return (
    <Stack style={{ width: '16rem' }}>
      <ColorInput
        label="Overlay"
        description="Type a color in hex, rgb() or hsl()"
        format="rgba"
        value={color()}
        onChange={setColor}
        swatches={['#e03131', '#f08c00', '#2f9e44', '#1971c2', '#7048e8', '#000000', '#ffffff']}
      />
      <Text size="sm">Value: {color() || 'none'}</Text>
    </Stack>
  );
}
