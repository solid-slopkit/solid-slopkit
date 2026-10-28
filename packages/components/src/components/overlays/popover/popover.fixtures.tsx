// SSR scenarios for popover.test.tsx.
import { Popover } from '.';

export const closed = () => (
  <Popover>
    <Popover.Target>{(target) => <button {...target}>Open</button>}</Popover.Target>
    <Popover.Dropdown aria-label="Details">Not rendered</Popover.Dropdown>
  </Popover>
);

export const open = () => (
  <Popover defaultOpened withArrow position="top-start" transition="pop">
    <Popover.Target>{(target) => <button {...target}>Open</button>}</Popover.Target>
    <Popover.Dropdown aria-label="Details" class="mine">
      <p>Rendered on the server, shown once hydrated.</p>
    </Popover.Dropdown>
  </Popover>
);
