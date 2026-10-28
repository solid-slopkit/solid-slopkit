import { createSignal } from 'solid-js';
import { Button, Paper, Stack, Text, Transition } from '@solid-slopkit/components';

export default function Basic() {
  const [opened, setOpened] = createSignal(false);

  return (
    <Stack align="flex-start">
      <Button onClick={() => setOpened((value) => !value)} aria-expanded={opened() ? 'true' : 'false'}>
        {opened() ? 'Hide' : 'Show'} details
      </Button>
      <Transition mounted={opened()} transition="fade-down">
        {(transition) => (
          <Paper {...transition} withBorder>
            <Text>It slides down a little as it fades in, and back up as it fades out.</Text>
          </Paper>
        )}
      </Transition>
    </Stack>
  );
}
