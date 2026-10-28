import { createSignal } from 'solid-js';
import { Button, Group, Modal, Stack, Text } from '@solid-slopkit/components';

export default function Confirm() {
  const [opened, setOpened] = createSignal(false);
  const close = () => setOpened(false);

  return (
    <>
      <Button color="error" variant="outline" onClick={() => setOpened(true)}>
        Delete project
      </Button>
      <Modal opened={opened()} onClose={close} title="Delete the project?" size="sm" centered closeOnClickOutside={false}>
        <Stack>
          <Text>Its tasks and files go with it. This can't be undone.</Text>
          <Group justify="flex-end">
            <Button variant="ghost" onClick={close} data-autofocus>
              Keep it
            </Button>
            <Button color="error" onClick={close}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
