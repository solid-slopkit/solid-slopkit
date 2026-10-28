import { createSignal, createUniqueId } from 'solid-js';
import { Button, Dialog, Group, Stack, Text, TextInput } from '@solid-slopkit/components';

export default function Basic() {
  const [opened, setOpened] = createSignal(false);
  const titleId = createUniqueId();

  return (
    <>
      <Button variant="outline" onClick={() => setOpened((value) => !value)}>
        {opened() ? 'Hide' : 'Show'} the feedback window
      </Button>
      <Dialog opened={opened()} onClose={() => setOpened(false)} aria-labelledby={titleId}>
        <Stack gap={3}>
          <Text id={titleId} weight="semibold">
            How is the new editor?
          </Text>
          <TextInput label="Your feedback" />
          <Group justify="flex-end">
            <Button size="sm" onClick={() => setOpened(false)}>
              Send
            </Button>
          </Group>
        </Stack>
      </Dialog>
    </>
  );
}
