import { For } from 'solid-js';
import { ChevronRight, House } from '@lucide/solid';
import { Anchor, Breadcrumbs, Stack, Text } from '@solid-slopkit/components';

const path = [
  { title: 'Projects', href: '#projects' },
  { title: 'slopkit', href: '#slopkit' },
  { title: 'Settings', href: '#settings' },
];

export default function Separator() {
  return (
    <Stack>
      <Breadcrumbs separator={<ChevronRight />}>
        <Anchor href="#home" aria-label="Home" underline="never">
          <House size={16} />
        </Anchor>
        <For each={path}>
          {(page) => (
            <Anchor href={page.href} underline="hover" size="sm">
              {page.title}
            </Anchor>
          )}
        </For>
        <Text as="span" size="sm" aria-current="page" dimmed>
          Members
        </Text>
      </Breadcrumbs>
    </Stack>
  );
}
