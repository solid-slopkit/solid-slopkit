import { createSignal, For } from 'solid-js';
import { Button, Modal, Stack, Text } from '@solid-slopkit/components';

export default function FullScreen() {
  const [opened, setOpened] = createSignal(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpened(true)}>
        Read the terms
      </Button>
      <Modal opened={opened()} onClose={() => setOpened(false)} title="Terms of service" fullScreen transition="fade">
        <Stack>
          <For each={Array.from({ length: 12 }, (_, index) => index + 1)}>
            {(section) => (
              <Text>
                {section}. Long content scrolls inside the modal, not the page behind it, which stays where it was while the modal
                is open.
              </Text>
            )}
          </For>
        </Stack>
      </Modal>
    </>
  );
}
