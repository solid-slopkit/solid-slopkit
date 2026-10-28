import { For } from 'solid-js';
import { ThemeIcon } from '@solid-slopkit/components';
import { Sparkles } from '@lucide/solid';

const colors = [undefined, 'neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] as const;
const variants = ['solid', 'soft', 'outline'] as const;

export default function Variants() {
  return (
    <For each={variants}>
      {(variant) => (
        <div style={{ display: 'flex', gap: '0.5rem', 'flex-wrap': 'wrap' }}>
          <For each={colors}>
            {(color) => (
              <ThemeIcon variant={variant} color={color}>
                <Sparkles aria-hidden="true" />
              </ThemeIcon>
            )}
          </For>
        </div>
      )}
    </For>
  );
}
