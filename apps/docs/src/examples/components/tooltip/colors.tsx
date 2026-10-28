import { For } from 'solid-js';
import { Button, Group, Tooltip } from '@solid-slopkit/components';

const colors = ['neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] as const;

export default function Colors() {
  return (
    <Group>
      <For each={colors}>
        {(color) => (
          <Tooltip label={`A ${color} tooltip`} color={color} withArrow>
            {(target) => (
              <Button {...target} variant="soft" color={color}>
                {color}
              </Button>
            )}
          </Tooltip>
        )}
      </For>
    </Group>
  );
}
