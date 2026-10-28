import { For } from 'solid-js';
import { Pill } from '@solid-slopkit/components';

const colors = ['neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] as const;

export default function Colors() {
  return (
    <Pill.Group>
      <Pill withRemoveButton>base</Pill>
      <For each={colors}>
        {(color) => (
          <Pill color={color} withRemoveButton>
            {color}
          </Pill>
        )}
      </For>
    </Pill.Group>
  );
}
