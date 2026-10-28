import { For } from 'solid-js';
import { Button, Group, Popover, Text, type PopoverPosition } from '@solid-slopkit/components';

const positions: PopoverPosition[] = ['top', 'right-start', 'bottom-end', 'left'];

export default function Position() {
  return (
    <Group>
      <For each={positions}>
        {(position) => (
          <Popover position={position} withArrow>
            <Popover.Target>
              {(target) => (
                <Button {...target} variant="outline">
                  {position}
                </Button>
              )}
            </Popover.Target>
            <Popover.Dropdown aria-label={`Placed ${position}`}>
              <Text size="sm">Placed {position}, flipped if there's no room.</Text>
            </Popover.Dropdown>
          </Popover>
        )}
      </For>
    </Group>
  );
}
