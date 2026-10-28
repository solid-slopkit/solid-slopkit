import { createSignal, For } from 'solid-js';
import { Button, Dialog, Group, Text, type DialogPosition } from '@solid-slopkit/components';

const positions: DialogPosition[] = ['top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right'];

export default function Position() {
  const [position, setPosition] = createSignal<DialogPosition>();

  return (
    <>
      <Group>
        <For each={positions}>
          {(place) => (
            <Button variant="outline" onClick={() => setPosition(place)}>
              {place}
            </Button>
          )}
        </For>
      </Group>
      <Dialog
        opened={position() !== undefined}
        onClose={() => setPosition(undefined)}
        position={position() ?? 'bottom-right'}
        size="sm"
        aria-label="Placement"
      >
        <Text size="sm">At {position()}, 16px from the edges.</Text>
      </Dialog>
    </>
  );
}
