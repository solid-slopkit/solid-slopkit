import { createSignal, For } from 'solid-js';
import { Button, Paper, SimpleGrid, Stack, Text, Transition, type TransitionName } from '@solid-slopkit/components';

const presets: TransitionName[] = [
  'fade',
  'fade-up',
  'fade-down',
  'fade-left',
  'fade-right',
  'scale',
  'scale-x',
  'scale-y',
  'pop',
  'slide-up',
  'slide-down',
  'slide-left',
  'slide-right',
  'rotate-left',
  'rotate-right',
];

export default function Presets() {
  const [opened, setOpened] = createSignal(true);

  return (
    <Stack align="flex-start" style={{ width: '100%' }}>
      <Button variant="outline" onClick={() => setOpened((value) => !value)}>
        Toggle all
      </Button>
      <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} style={{ width: '100%' }}>
        <For each={presets}>
          {(name) => (
            <div style={{ height: '3rem', overflow: 'hidden' }}>
              <Transition mounted={opened()} transition={name} duration={400}>
                {(transition) => (
                  <Paper {...transition} withBorder padding="xs" style={{ ...transition.style, height: '100%' }}>
                    <Text size="sm">{name}</Text>
                  </Paper>
                )}
              </Transition>
            </div>
          )}
        </For>
      </SimpleGrid>
    </Stack>
  );
}
