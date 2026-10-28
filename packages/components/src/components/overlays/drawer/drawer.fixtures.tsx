// SSR scenarios for drawer.test.tsx.
import { Drawer } from '.';

const noop = () => {};

export const closed = () => (
  <div>
    <p>Page</p>
    <Drawer opened={false} onClose={noop} title="Not rendered">
      <p>Hidden</p>
    </Drawer>
  </div>
);

export const open = () => (
  <Drawer opened onClose={noop} title="Filters" position="right" size="lg" class="mine">
    <p>Rendered on the server, shown once hydrated.</p>
  </Drawer>
);
