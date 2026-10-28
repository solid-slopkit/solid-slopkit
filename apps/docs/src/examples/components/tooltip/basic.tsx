import { Copy, Pencil, Trash2 } from '@lucide/solid';
import { ActionIcon, Group, Tooltip } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Group>
      <Tooltip label="Copies the link to this page">
        {(target) => (
          <ActionIcon {...target} variant="outline" label="Copy link">
            <Copy />
          </ActionIcon>
        )}
      </Tooltip>
      <Tooltip label="Renames the project">
        {(target) => (
          <ActionIcon {...target} variant="outline" label="Rename">
            <Pencil />
          </ActionIcon>
        )}
      </Tooltip>
      <Tooltip label="Moves the project to the bin for 30 days" color="error">
        {(target) => (
          <ActionIcon {...target} variant="outline" label="Delete">
            <Trash2 />
          </ActionIcon>
        )}
      </Tooltip>
    </Group>
  );
}
