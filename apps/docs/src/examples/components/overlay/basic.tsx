import { createSignal, Show } from 'solid-js';
import { Overlay, Paper, Stack, Switch, Text } from '@solid-slopkit/components';

export default function Basic() {
  const [visible, setVisible] = createSignal(true);

  return (
    <Stack>
      <Switch label="Show the overlay" checked={visible()} onChange={setVisible} />
      <Paper withBorder style={{ position: 'relative' }}>
        <Text>
          The overlay fills the nearest positioned parent and takes its rounded corners. While it's there, nothing under it can be
          clicked.
        </Text>
        <Show when={visible()}>
          <Overlay />
        </Show>
      </Paper>
    </Stack>
  );
}
