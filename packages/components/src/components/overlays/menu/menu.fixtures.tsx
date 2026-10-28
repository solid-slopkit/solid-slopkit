// SSR scenarios for menu.test.tsx.
import { Menu } from '.';

export const closed = () => (
  <Menu>
    <Menu.Target>{(target) => <button {...target}>Actions</button>}</Menu.Target>
    <Menu.Dropdown>
      <Menu.Item>Not rendered</Menu.Item>
    </Menu.Dropdown>
  </Menu>
);

export const open = () => (
  <Menu defaultOpened withArrow position="bottom-end">
    <Menu.Target>{(target) => <button {...target}>Actions</button>}</Menu.Target>
    <Menu.Dropdown class="mine">
      <Menu.Label>Project</Menu.Label>
      <Menu.Item leftSection={<span>✎</span>} rightSection="⌘R">
        Rename
      </Menu.Item>
      <Menu.Item as="a" href="#settings">
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item color="error" disabled>
        Delete
      </Menu.Item>
    </Menu.Dropdown>
  </Menu>
);
