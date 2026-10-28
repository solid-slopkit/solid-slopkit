import { For } from 'solid-js';
import { Avatar } from '@solid-slopkit/components';

const colors = [undefined, 'neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] as const;
const variants = ['soft', 'solid', 'outline'] as const;

export default function Variants() {
  return (
    <For each={variants}>
      {(variant) => (
        <div style={{ display: 'flex', gap: '0.5rem', 'flex-wrap': 'wrap' }}>
          <For each={colors}>{(color) => <Avatar name="Alan Turing" variant={variant} color={color} />}</For>
        </div>
      )}
    </For>
  );
}
