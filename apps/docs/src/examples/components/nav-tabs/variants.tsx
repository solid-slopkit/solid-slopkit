import { For } from 'solid-js';
import { NavTabs, Stack, type TabsVariant } from '@solid-slopkit/components';
import { withBase } from '../../../base';

const variants: TabsVariant[] = ['underline', 'outline', 'pills', 'soft'];
const links = [
  { path: '/components/nav-tabs', label: 'NavTabs' },
  { path: '/components/tabs', label: 'Tabs' },
  { path: '/components/nav-link', label: 'NavLink' },
];

export default function Variants() {
  return (
    <Stack gap={6}>
      <For each={variants}>
        {(variant) => (
          <NavTabs
            variant={variant}
            color={variant === 'pills' || variant === 'soft' ? 'secondary' : 'primary'}
            aria-label={`${variant} links`}
          >
            <For each={links}>{(link) => <NavTabs.Link href={withBase(link.path)}>{link.label}</NavTabs.Link>}</For>
          </NavTabs>
        )}
      </For>
    </Stack>
  );
}
