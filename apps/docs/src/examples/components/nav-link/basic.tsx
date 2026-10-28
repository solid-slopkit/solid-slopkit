import { For } from 'solid-js';
import { Link, PanelLeft, PanelTop } from '@lucide/solid';
import { Badge, NavLink } from '@solid-slopkit/components';
import { withBase } from '../../../base';

// Links to pages of these docs: the router marks the link to this page, which NavLink draws as current.
const links = [
  { path: '/components/nav-link', label: 'NavLink', icon: Link, description: 'A link in a navigation list' },
  { path: '/components/nav-tabs', label: 'NavTabs', icon: PanelTop, badge: 'new' },
  { path: '/components/app-shell', label: 'AppShell', icon: PanelLeft },
];

export default function Basic() {
  return (
    <nav aria-label="Example" style={{ width: '260px' }}>
      <For each={links}>
        {(link) => (
          <NavLink
            href={withBase(link.path)}
            label={link.label}
            description={link.description}
            leftSection={<link.icon />}
            rightSection={link.badge ? <Badge size="sm">{link.badge}</Badge> : undefined}
          />
        )}
      </For>
      <NavLink href={withBase('/components/stepper')} label="Stepper" disabled />
    </nav>
  );
}
