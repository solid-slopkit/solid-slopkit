import { For } from 'solid-js';
import { Mark, Text } from '@solid-slopkit/components';

const colors = ['neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] as const;

export default function Colors() {
  return (
    <Text>
      <For each={colors}>
        {(color) => (
          <>
            <Mark color={color}>{color}</Mark>{' '}
          </>
        )}
      </For>
    </Text>
  );
}
