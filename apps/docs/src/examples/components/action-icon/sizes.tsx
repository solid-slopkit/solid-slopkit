import { Ellipsis, Plus } from '@lucide/solid';
import { ActionIcon, Button, Group, Stack } from '@solid-slopkit/components';

export default function Sizes() {
  return (
    <Stack gap={4}>
      <Group>
        <ActionIcon label="Add" size="xs" variant="soft">
          <Plus aria-hidden="true" />
        </ActionIcon>
        <ActionIcon label="Add" size="sm" variant="soft">
          <Plus aria-hidden="true" />
        </ActionIcon>
        <ActionIcon label="Add" size="md" variant="soft">
          <Plus aria-hidden="true" />
        </ActionIcon>
        <ActionIcon label="Add" size="lg" variant="soft" shape="circle">
          <Plus aria-hidden="true" />
        </ActionIcon>
        <ActionIcon label="Add" size="xl" variant="soft" shape="circle">
          <Plus aria-hidden="true" />
        </ActionIcon>
      </Group>
      {/* The same heights as Button, so they line up. */}
      <Group gap={2}>
        <Button variant="outline">Export</Button>
        <ActionIcon label="More options" variant="outline">
          <Ellipsis aria-hidden="true" />
        </ActionIcon>
      </Group>
    </Stack>
  );
}
