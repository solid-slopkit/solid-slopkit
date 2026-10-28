// SSR scenarios for app-shell.test.tsx.
import { AppShell } from '.';

const Icon = () => <svg aria-hidden="true" />;

const sidebar = () => (
  <>
    <AppShell.SidebarHeader>Acme</AppShell.SidebarHeader>
    <AppShell.SidebarContent>
      <AppShell.Group label="Platform">
        <AppShell.GroupAction label="Add project">
          <Icon />
        </AppShell.GroupAction>
        <AppShell.Menu>
          <AppShell.MenuItem>
            <AppShell.MenuButton href="/" icon={<Icon />} tooltip="Home" data-active aria-current="page">
              Home
            </AppShell.MenuButton>
            <AppShell.MenuBadge>24</AppShell.MenuBadge>
          </AppShell.MenuItem>
          <AppShell.MenuItem>
            <AppShell.MenuButton icon={<Icon />} size="lg">
              Projects
            </AppShell.MenuButton>
            <AppShell.MenuAction label="More" showOnHover>
              <Icon />
            </AppShell.MenuAction>
            <AppShell.MenuSub>
              <AppShell.MenuSubItem>
                <AppShell.MenuSubButton href="/projects/design" size="sm">
                  Design
                </AppShell.MenuSubButton>
              </AppShell.MenuSubItem>
            </AppShell.MenuSub>
          </AppShell.MenuItem>
        </AppShell.Menu>
      </AppShell.Group>
    </AppShell.SidebarContent>
    <AppShell.SidebarFooter>Footer</AppShell.SidebarFooter>
    <AppShell.Rail />
  </>
);

export const expanded = () => (
  <AppShell class="mine">
    <AppShell.Sidebar variant="floating">{sidebar()}</AppShell.Sidebar>
    <AppShell.Main>
      <AppShell.Trigger />
      <p>Content</p>
    </AppShell.Main>
  </AppShell>
);

export const collapsedToIcons = () => (
  <AppShell defaultOpened={false} shortcut={null}>
    <AppShell.Sidebar collapsible="icon" variant="inset" position="right" label="Navigation">
      {sidebar()}
    </AppShell.Sidebar>
    <AppShell.Main as="div">
      <AppShell.Trigger label="Menu" />
    </AppShell.Main>
  </AppShell>
);
