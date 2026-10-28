import { MousePointerClick, Navigation } from '@lucide/solid';
import { NavLink } from '@solid-slopkit/components';
import { withBase } from '../../../base';

export default function Nested() {
  return (
    <nav aria-label="Example" style={{ width: '260px' }}>
      <NavLink label="Navigation" leftSection={<Navigation />} defaultOpened>
        <NavLink href={withBase('/components/nav-link')} label="NavLink" />
        <NavLink href={withBase('/components/nav-tabs')} label="NavTabs" />
      </NavLink>
      <NavLink label="Buttons" leftSection={<MousePointerClick />}>
        <NavLink href={withBase('/components/button')} label="Button" />
        <NavLink label="Icons">
          <NavLink href={withBase('/components/action-icon')} label="ActionIcon" />
          <NavLink href={withBase('/components/close-button')} label="CloseButton" />
        </NavLink>
      </NavLink>
    </nav>
  );
}
