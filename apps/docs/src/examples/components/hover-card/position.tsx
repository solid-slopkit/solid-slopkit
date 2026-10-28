import { For } from 'solid-js';
import { Button, Group, HoverCard, Text, type HoverCardPosition } from '@solid-slopkit/components';

const positions: HoverCardPosition[] = ['top', 'right-start', 'bottom-end', 'left'];

export default function Position() {
  return (
    <Group>
      <For each={positions}>
        {(position) => (
          <HoverCard position={position} withArrow>
            <HoverCard.Target>
              {(target) => (
                <Button {...target} variant="outline">
                  {position}
                </Button>
              )}
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <Text size="sm">Placed {position}, flipped if there's no room.</Text>
            </HoverCard.Dropdown>
          </HoverCard>
        )}
      </For>
    </Group>
  );
}
