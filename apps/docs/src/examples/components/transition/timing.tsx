import { createSignal } from 'solid-js';
import { Button, Paper, Stack, Text, Transition } from '@solid-slopkit/components';

export default function Timing() {
  const [opened, setOpened] = createSignal(false);

  return (
    <Stack align="flex-start">
      <Button variant="outline" onClick={() => setOpened((value) => !value)}>
        Toggle
      </Button>
      <Transition
        mounted={opened()}
        transition="pop"
        duration={400}
        exitDuration={150}
        timingFunction="cubic-bezier(0.3, 1.5, 0.6, 1)"
        keepMounted
      >
        {(transition) => (
          <Paper {...transition} withBorder>
            <Text>Slow in with an overshoot, quick out, and kept in the DOM while hidden.</Text>
          </Paper>
        )}
      </Transition>
    </Stack>
  );
}
