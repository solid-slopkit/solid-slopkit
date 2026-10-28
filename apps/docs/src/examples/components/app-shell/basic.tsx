import { createSignal, For, Show } from 'solid-js';
import {
  BookOpen,
  ChevronRight,
  ChevronsUpDown,
  Ellipsis,
  Folder,
  GalleryVerticalEnd,
  House,
  LayoutGrid,
  PanelLeft,
  Palette,
  Plus,
} from '@lucide/solid';
import { AppShell, Avatar, Text } from '@solid-slopkit/components';
import { withBase } from '../../../base';

// The rows link to pages of these docs: the router marks the row for this page, and the others go to theirs.
const pages = [
  { path: '/', label: 'Introduction', icon: House },
  { path: '/components/overview', label: 'Overview', icon: LayoutGrid, count: 12 },
  { path: '/components/app-shell', label: 'AppShell', icon: PanelLeft },
  { path: '/components/theming', label: 'Theming', icon: Palette },
];

const guides = [
  { path: '/components/nav-link', label: 'NavLink' },
  { path: '/components/nav-tabs', label: 'NavTabs' },
  { path: '/components/tabs', label: 'Tabs' },
];

const projects = [
  { path: '/components/button', label: 'Button' },
  { path: '/components/menu', label: 'Menu' },
  { path: '/components/tooltip', label: 'Tooltip' },
];

export default function Basic() {
  const [guidesOpened, setGuidesOpened] = createSignal(true);

  // The docs' own shell answers ⌘B / Ctrl+B.
  return (
    <AppShell class="docs-app-shell" shortcut={null}>
      <AppShell.Sidebar collapsible="icon" label="Navigation">
        <AppShell.SidebarHeader>
          <AppShell.Menu>
            <AppShell.MenuItem>
              <AppShell.MenuButton size="lg" icon={<GalleryVerticalEnd />} tooltip="Acme Inc.">
                <span style={{ display: 'flex', 'flex-direction': 'column', flex: 1, 'min-width': 0 }}>
                  <strong>Acme Inc.</strong>
                  <span style={{ 'font-size': 'var(--slp-font-size-xs)' }}>Enterprise</span>
                </span>
                <ChevronsUpDown size={16} />
              </AppShell.MenuButton>
            </AppShell.MenuItem>
          </AppShell.Menu>
        </AppShell.SidebarHeader>

        <AppShell.SidebarContent>
          <nav aria-label="Main">
            <AppShell.Group label="Docs">
              <AppShell.Menu>
                <For each={pages}>
                  {(page) => (
                    <AppShell.MenuItem>
                      <AppShell.MenuButton href={withBase(page.path)} icon={<page.icon />} tooltip={page.label}>
                        {page.label}
                      </AppShell.MenuButton>
                      <Show when={page.count}>{(count) => <AppShell.MenuBadge>{count()}</AppShell.MenuBadge>}</Show>
                    </AppShell.MenuItem>
                  )}
                </For>
                <AppShell.MenuItem>
                  <AppShell.MenuButton
                    icon={<BookOpen />}
                    tooltip="Navigation"
                    aria-expanded={guidesOpened() ? 'true' : 'false'}
                    onClick={() => setGuidesOpened(!guidesOpened())}
                  >
                    Navigation
                    <ChevronRight
                      size={16}
                      style={{ transform: guidesOpened() ? 'rotate(90deg)' : undefined, transition: 'transform 200ms' }}
                    />
                  </AppShell.MenuButton>
                  <Show when={guidesOpened()}>
                    <AppShell.MenuSub>
                      <For each={guides}>
                        {(guide) => (
                          <AppShell.MenuSubItem>
                            <AppShell.MenuSubButton href={withBase(guide.path)}>{guide.label}</AppShell.MenuSubButton>
                          </AppShell.MenuSubItem>
                        )}
                      </For>
                    </AppShell.MenuSub>
                  </Show>
                </AppShell.MenuItem>
              </AppShell.Menu>
            </AppShell.Group>

            <AppShell.Group label="Components">
              <AppShell.GroupAction label="Add component">
                <Plus />
              </AppShell.GroupAction>
              <AppShell.Menu>
                <For each={projects}>
                  {(project) => (
                    <AppShell.MenuItem>
                      <AppShell.MenuButton href={withBase(project.path)} icon={<Folder />} tooltip={project.label}>
                        {project.label}
                      </AppShell.MenuButton>
                      <AppShell.MenuAction label={`More for ${project.label}`} showOnHover>
                        <Ellipsis />
                      </AppShell.MenuAction>
                    </AppShell.MenuItem>
                  )}
                </For>
              </AppShell.Menu>
            </AppShell.Group>
          </nav>
        </AppShell.SidebarContent>

        <AppShell.SidebarFooter>
          <AppShell.Menu>
            <AppShell.MenuItem>
              <AppShell.MenuButton size="lg" icon={<Avatar size="sm" name="Ada Lovelace" />} tooltip="Ada Lovelace">
                <span style={{ display: 'flex', 'flex-direction': 'column', 'min-width': 0 }}>
                  <strong>Ada Lovelace</strong>
                  <span style={{ 'font-size': 'var(--slp-font-size-xs)' }}>ada@acme.dev</span>
                </span>
              </AppShell.MenuButton>
            </AppShell.MenuItem>
          </AppShell.Menu>
        </AppShell.SidebarFooter>
        <AppShell.Rail />
      </AppShell.Sidebar>

      <AppShell.Main as="div">
        <header class="docs-app-shell-header">
          <AppShell.Trigger />
          <Text weight="medium">AppShell</Text>
        </header>
        <div class="docs-app-shell-body">
          <Text>Press the button or the rail along the sidebar's edge to collapse it to its icons.</Text>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
