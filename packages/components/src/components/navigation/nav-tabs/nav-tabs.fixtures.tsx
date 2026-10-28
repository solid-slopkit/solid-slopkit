// SSR scenarios for nav-tabs.test.tsx.
import { NavTabs } from '.';

export const navTabs = () => (
  <div>
    <NavTabs aria-label="Project" class="mine">
      <NavTabs.Link href="/" data-active aria-current="page" leftSection={<span>*</span>}>
        Overview
      </NavTabs.Link>
      <NavTabs.Link href="/activity" rightSection={<span>3</span>}>
        Activity
      </NavTabs.Link>
      <NavTabs.Link href="/settings" disabled>
        Settings
      </NavTabs.Link>
    </NavTabs>
    <NavTabs aria-label="Account" variant="soft" orientation="vertical" color="secondary" size="sm" grow>
      <NavTabs.Link href="/profile">Profile</NavTabs.Link>
      <NavTabs.Link href="/security" data-active aria-current="page">
        Security
      </NavTabs.Link>
    </NavTabs>
  </div>
);
