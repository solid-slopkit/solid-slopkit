import { Folder, Link, ListOrdered, PanelTop } from '@lucide/solid';
import { Badge, NavTabs } from '@solid-slopkit/components';
import { withBase } from '../../../base';

// Links to pages of these docs: the router marks the link to this page, which NavTabs draws as the selected tab.
export default function Basic() {
  return (
    <NavTabs aria-label="Navigation components">
      <NavTabs.Link
        href={withBase('/components/nav-tabs')}
        leftSection={<PanelTop />}
        rightSection={<Badge size="xs">new</Badge>}
      >
        NavTabs
      </NavTabs.Link>
      <NavTabs.Link href={withBase('/components/tabs')} leftSection={<Folder />}>
        Tabs
      </NavTabs.Link>
      <NavTabs.Link href={withBase('/components/nav-link')} leftSection={<Link />}>
        NavLink
      </NavTabs.Link>
      <NavTabs.Link href={withBase('/components/stepper')} leftSection={<ListOrdered />} disabled>
        Stepper
      </NavTabs.Link>
    </NavTabs>
  );
}
