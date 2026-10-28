import { createSignal } from 'solid-js';
import { FileText, House, Search, User } from '@lucide/solid';
import { Button, Command, CommandDialog, Group, Kbd, Text, useNotifications } from '@solid-slopkit/components';

export default function Dialog() {
  const [opened, setOpened] = createSignal(false);
  const notifications = useNotifications();
  const go = (page: string) => notifications.show({ message: `Opened ${page}` });

  return (
    <Group>
      <Button variant="outline" leftSection={<Search />} onClick={() => setOpened(true)}>
        Search
      </Button>
      <Text size="sm">
        or press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> (<Kbd>⌘</Kbd> <Kbd>K</Kbd> on a Mac)
      </Text>
      <CommandDialog opened={opened()} onOpenedChange={setOpened}>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Empty>Nothing found</Command.Empty>
          <Command.Item onSelect={go}>
            <House />
            Home
          </Command.Item>
          <Command.Item keywords={['help', 'manual']} onSelect={go}>
            <FileText />
            Documentation
          </Command.Item>
          <Command.Group heading="Settings">
            <Command.Item keywords={['account', 'name']} onSelect={go}>
              <User />
              Profile
            </Command.Item>
          </Command.Group>
        </Command.List>
      </CommandDialog>
    </Group>
  );
}
