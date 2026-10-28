import { Ellipsis, ExternalLink } from '@lucide/solid';
import { ActionIcon, Menu } from '@solid-slopkit/components';

export default function Links() {
  return (
    <Menu position="bottom-end" withArrow>
      <Menu.Target>
        {(target) => (
          <ActionIcon {...target} variant="ghost" label="More">
            <Ellipsis />
          </ActionIcon>
        )}
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item as="a" href="#settings">
          Settings
        </Menu.Item>
        <Menu.Item as="a" href="#changelog">
          Changelog
        </Menu.Item>
        <Menu.Item as="a" href="https://github.com/solid-slopkit/solid-slopkit" target="_blank" rightSection={<ExternalLink />}>
          Source
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
