import { createSignal } from 'solid-js';
import { Button, Group, Popover, Stack, Text } from '@solid-slopkit/components';

export default function Controlled() {
  const [opened, setOpened] = createSignal(false);

  return (
    <Popover opened={opened()} onChange={setOpened} trapFocus transition="pop">
      <Popover.Target>
        {(target) => (
          <Button {...target} color="error" variant="soft">
            Delete project
          </Button>
        )}
      </Popover.Target>
      <Popover.Dropdown aria-label="Confirm deletion">
        <Stack gap={2}>
          <Text size="sm">This can't be undone.</Text>
          <Group gap={2}>
            <Button size="sm" variant="outline" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button size="sm" color="error" onClick={() => setOpened(false)}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
