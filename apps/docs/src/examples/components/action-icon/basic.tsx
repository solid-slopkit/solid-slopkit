import { Copy, Pencil, Trash2 } from '@lucide/solid';
import { ActionIcon, Group } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Group gap={1}>
      <ActionIcon label="Edit">
        <Pencil aria-hidden="true" />
      </ActionIcon>
      <ActionIcon label="Duplicate">
        <Copy aria-hidden="true" />
      </ActionIcon>
      <ActionIcon label="Delete" color="error">
        <Trash2 aria-hidden="true" />
      </ActionIcon>
    </Group>
  );
}
