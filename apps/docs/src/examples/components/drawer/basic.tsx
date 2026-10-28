import { createSignal, For } from 'solid-js';
import { Anchor, Button, Drawer, Stack } from '@solid-slopkit/components';

const links = ['Dashboard', 'Projects', 'Invoices', 'Team', 'Settings'];

export default function Basic() {
  const [opened, setOpened] = createSignal(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpened(true)}>
        Open navigation
      </Button>
      <Drawer opened={opened()} onClose={() => setOpened(false)} title="Navigation" size="xs">
        <Stack gap={2}>
          <For each={links}>
            {(link) => (
              <Anchor href={`#${link.toLowerCase()}`} underline="hover" onClick={() => setOpened(false)}>
                {link}
              </Anchor>
            )}
          </For>
        </Stack>
      </Drawer>
    </>
  );
}
