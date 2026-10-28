import { For } from 'solid-js';
import { Button, Group, Tooltip, type TooltipPosition } from '@solid-slopkit/components';

const positions: TooltipPosition[] = ['top', 'right', 'bottom-start', 'left'];

export default function Position() {
  return (
    <Group>
      <For each={positions}>
        {(position) => (
          <Tooltip label={`Placed ${position}`} position={position} withArrow>
            {(target) => (
              <Button {...target} variant="outline">
                {position}
              </Button>
            )}
          </Tooltip>
        )}
      </For>
    </Group>
  );
}
