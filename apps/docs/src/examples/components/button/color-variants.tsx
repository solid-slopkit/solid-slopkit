import { For } from 'solid-js';
import { Button } from '@solid-slopkit/components';

const colors = ['primary', 'info', 'success', 'warning', 'error'] as const;

export default function ColorVariants() {
  return (
    <For each={colors}>
      {(color) => (
        <div style={{ display: 'flex', gap: '0.5rem', 'flex-wrap': 'wrap' }}>
          <Button color={color} variant="soft">
            Soft
          </Button>
          <Button color={color} variant="outline">
            Outline
          </Button>
          <Button color={color} variant="dash">
            Dash
          </Button>
          <Button color={color} variant="ghost">
            Ghost
          </Button>
        </div>
      )}
    </For>
  );
}
