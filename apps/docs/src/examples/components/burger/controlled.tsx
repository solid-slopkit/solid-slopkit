import { createSignal, Show } from 'solid-js';
import { Anchor, Burger, Paper, Stack } from '@solid-slopkit/components';

export default function Controlled() {
  const [opened, setOpened] = createSignal(false);

  return (
    <Stack gap={2} align="flex-start">
      <Burger opened={opened()} onChange={setOpened} aria-controls="example-nav" />
      <Show when={opened()}>
        <Paper id="example-nav" padding="sm" withBorder>
          <nav aria-label="Example">
            <Stack gap={1}>
              <Anchor href="#usage">Usage</Anchor>
              <Anchor href="#props">Props</Anchor>
              <Anchor href="#styling">Styling</Anchor>
            </Stack>
          </nav>
        </Paper>
      </Show>
    </Stack>
  );
}
