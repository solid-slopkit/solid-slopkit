import { For } from 'solid-js';
import { Badge } from '@solid-slopkit/components';

const colors = ['neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] as const;
const variants = ['solid', 'soft', 'outline', 'dash'] as const;

export default function Colors() {
  return (
    <For each={variants}>
      {(variant) => (
        <div style={{ display: 'flex', gap: '0.5rem', 'flex-wrap': 'wrap', 'align-items': 'center' }}>
          <Badge variant={variant}>base</Badge>
          <For each={colors}>
            {(color) => (
              <Badge variant={variant} color={color}>
                {color}
              </Badge>
            )}
          </For>
        </div>
      )}
    </For>
  );
}
