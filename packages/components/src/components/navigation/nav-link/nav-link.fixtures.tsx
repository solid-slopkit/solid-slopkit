// SSR scenarios for nav-link.test.tsx.
import { NavLink } from '.';

export const navLinks = () => (
  <nav>
    <NavLink href="/" label="Home" leftSection={<span>*</span>} data-active aria-current="page" class="mine" />
    <NavLink
      href="/inbox"
      label="Inbox"
      description="3 unread"
      rightSection={<span>3</span>}
      variant="solid"
      color="secondary"
      noWrap
    />
    <NavLink href="/archive" label="Archive" disabled />
    <NavLink label="Settings" defaultOpened>
      <NavLink href="/settings/profile" label="Profile" />
      <NavLink label="Security" chevron={<span>v</span>}>
        <NavLink href="/settings/security/keys" label="Keys" />
      </NavLink>
    </NavLink>
  </nav>
);
