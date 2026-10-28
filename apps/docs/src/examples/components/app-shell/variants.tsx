import { createSignal, For } from 'solid-js';
import { House, LayoutGrid, PanelLeft } from '@lucide/solid';
import {
  AppShell,
  Group,
  SegmentedControl,
  Stack,
  Text,
  type AppShellSidebarCollapsible,
  type AppShellSidebarPosition,
  type AppShellSidebarVariant,
} from '@solid-slopkit/components';
import { withBase } from '../../../base';

// Links to pages of these docs: the router marks the row for this page.
const pages = [
  { path: '/', label: 'Introduction', icon: House },
  { path: '/components/overview', label: 'Overview', icon: LayoutGrid },
  { path: '/components/app-shell', label: 'AppShell', icon: PanelLeft },
];

export default function Variants() {
  const [variant, setVariant] = createSignal<AppShellSidebarVariant>('floating');
  const [collapsible, setCollapsible] = createSignal<AppShellSidebarCollapsible>('offcanvas');
  const [position, setPosition] = createSignal<AppShellSidebarPosition>('left');

  return (
    <Stack style={{ width: '100%' }}>
      <Group>
        <SegmentedControl
          aria-label="Variant"
          data={['sidebar', 'floating', 'inset']}
          value={variant()}
          onChange={(value) => setVariant(value as AppShellSidebarVariant)}
        />
        <SegmentedControl
          aria-label="Collapsible"
          data={['offcanvas', 'icon', 'none']}
          value={collapsible()}
          onChange={(value) => setCollapsible(value as AppShellSidebarCollapsible)}
        />
        <SegmentedControl
          aria-label="Position"
          data={['left', 'right']}
          value={position()}
          onChange={(value) => setPosition(value as AppShellSidebarPosition)}
        />
      </Group>
      {/* The docs' own shell answers ⌘B / Ctrl+B. */}
      <AppShell class="docs-app-shell" shortcut={null}>
        <AppShell.Sidebar variant={variant()} collapsible={collapsible()} position={position()}>
          <AppShell.SidebarHeader>
            <Text weight="semibold" truncate>
              Acme Inc.
            </Text>
          </AppShell.SidebarHeader>
          <AppShell.SidebarContent>
            <AppShell.Group label="Platform">
              <AppShell.Menu>
                <For each={pages}>
                  {(page) => (
                    <AppShell.MenuItem>
                      <AppShell.MenuButton href={withBase(page.path)} icon={<page.icon />} tooltip={page.label}>
                        {page.label}
                      </AppShell.MenuButton>
                    </AppShell.MenuItem>
                  )}
                </For>
              </AppShell.Menu>
            </AppShell.Group>
          </AppShell.SidebarContent>
          <AppShell.Rail />
        </AppShell.Sidebar>
        <AppShell.Main as="div">
          <header class="docs-app-shell-header">
            <AppShell.Trigger />
            <Text weight="medium">
              {variant()}, {collapsible()}
            </Text>
          </header>
        </AppShell.Main>
      </AppShell>
    </Stack>
  );
}
