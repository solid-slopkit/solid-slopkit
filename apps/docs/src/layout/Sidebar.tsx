import { For } from 'solid-js';
import { useLocation, useNavigate } from '@solidjs/router';
import { AppShell, Select } from '@solid-slopkit/components';
import { packageAt, packages, type NavItem, type NavSection } from '../nav';
import { docsPath, withBase } from '../base';

const homeNav: NavSection[] = [{ title: 'Packages', items: packages.map((pkg) => ({ title: pkg.title, href: pkg.href })) }];

function NavMenu(props: { items: NavItem[] }) {
  return (
    <AppShell.Menu>
      <For each={props.items}>
        {(item) => (
          <AppShell.MenuItem>
            <AppShell.MenuButton href={withBase(item.href)}>{item.title}</AppShell.MenuButton>
          </AppShell.MenuItem>
        )}
      </For>
    </AppShell.Menu>
  );
}

// Picks the package whose docs the sidebar shows, and goes to its first page.
function PackagePicker(props: { value: string | null }) {
  const navigate = useNavigate();
  return (
    <Select
      class="docs-package-picker"
      aria-label="Package"
      size="sm"
      placeholder="Pick a package"
      data={packages.map((pkg) => ({ value: pkg.id, label: pkg.title }))}
      value={props.value}
      onChange={(id) => navigate(packages.find((pkg) => pkg.id === id)!.href)}
    />
  );
}

// Plain anchors, which the router navigates through and marks as current. The sidebar
// lists the current package's pages, or every package on the home page.
export function Sidebar() {
  const location = useLocation();
  const current = () => packageAt(docsPath(location.pathname));
  return (
    <AppShell.Sidebar label="Navigation" class="docs-sidebar">
      <AppShell.SidebarHeader class="docs-sidebar-header">
        <a class="docs-wordmark" href={withBase('/')}>
          slopkit
        </a>
      </AppShell.SidebarHeader>
      <AppShell.SidebarContent>
        <PackagePicker value={current()?.id ?? null} />
        <nav aria-label="Documentation">
          <For each={current()?.nav ?? homeNav}>
            {(section) => (
              <>
                <AppShell.Group label={section.title} class="docs-nav-section">
                  <NavMenu items={section.items} />
                </AppShell.Group>
                <For each={section.groups ?? []}>
                  {(group) => (
                    <AppShell.Group label={group.title}>
                      <NavMenu items={group.items} />
                    </AppShell.Group>
                  )}
                </For>
              </>
            )}
          </For>
        </nav>
      </AppShell.SidebarContent>
      <AppShell.Rail />
    </AppShell.Sidebar>
  );
}
