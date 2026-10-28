import { createSignal, For } from 'solid-js';
import { Button, Drawer, Group, Text, type DrawerPosition } from '@solid-slopkit/components';

const positions: DrawerPosition[] = ['left', 'right', 'top', 'bottom'];

export default function Position() {
  const [position, setPosition] = createSignal<DrawerPosition>();

  return (
    <>
      <Group>
        <For each={positions}>
          {(edge) => (
            <Button variant="outline" onClick={() => setPosition(edge)}>
              {edge}
            </Button>
          )}
        </For>
      </Group>
      <Drawer
        opened={position() !== undefined}
        onClose={() => setPosition(undefined)}
        position={position() ?? 'left'}
        size="sm"
        title={`From the ${position() ?? 'left'}`}
      >
        <Text>It slides in from its edge; from the top or bottom, the size is its height.</Text>
      </Drawer>
    </>
  );
}
