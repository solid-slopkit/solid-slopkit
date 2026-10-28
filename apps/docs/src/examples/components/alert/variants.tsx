import { For } from 'solid-js';
import { Alert, Stack } from '@solid-slopkit/components';
import { Sparkles } from '@lucide/solid';

const variants = ['soft', 'outline', 'solid'] as const;

export default function Variants() {
  return (
    <Stack gap={3} style={{ width: '100%' }}>
      <For each={variants}>
        {(variant) => (
          <Alert variant={variant} color="secondary" icon={<Sparkles aria-hidden="true" />} title={variant} role="note">
            A message in the {variant} variant.
          </Alert>
        )}
      </For>
    </Stack>
  );
}
