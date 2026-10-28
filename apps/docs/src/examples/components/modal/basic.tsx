import { createSignal } from 'solid-js';
import { Button, Group, Modal, Stack, TextInput } from '@solid-slopkit/components';

export default function Basic() {
  const [opened, setOpened] = createSignal(false);
  const close = () => setOpened(false);

  return (
    <>
      <Button onClick={() => setOpened(true)}>Edit profile</Button>
      <Modal opened={opened()} onClose={close} title="Edit profile">
        <Stack>
          <TextInput label="Name" value="Ada Lovelace" data-autofocus />
          <TextInput label="Email" value="ada@example.com" />
          <Group justify="flex-end">
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button onClick={close}>Save</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
