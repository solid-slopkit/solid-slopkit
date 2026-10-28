import { Archive, Copy, Pencil, Trash2 } from '@lucide/solid';
import { Button, Kbd, Menu } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Menu>
      <Menu.Target>
        {(target) => (
          <Button {...target} variant="outline">
            Actions
          </Button>
        )}
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Project</Menu.Label>
        <Menu.Item leftSection={<Pencil />} rightSection={<Kbd>R</Kbd>}>
          Rename
        </Menu.Item>
        <Menu.Item leftSection={<Copy />} rightSection={<Kbd>D</Kbd>}>
          Duplicate
        </Menu.Item>
        <Menu.Item leftSection={<Archive />} disabled>
          Archive
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item leftSection={<Trash2 />} color="error">
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
