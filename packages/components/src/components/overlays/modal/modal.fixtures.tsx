// SSR scenarios for modal.test.tsx.
import { Modal } from '.';

const noop = () => {};

export const closed = () => (
  <div>
    <p>Page</p>
    <Modal opened={false} onClose={noop} title="Not rendered">
      <p>Hidden</p>
    </Modal>
  </div>
);

export const open = () => (
  <Modal opened onClose={noop} title="Edit profile" size="lg" centered class="mine">
    <p>Rendered on the server, shown once hydrated.</p>
  </Modal>
);

export const untitled = () => (
  <Modal opened onClose={noop} withCloseButton={false} aria-label="Confirm">
    <p>No header</p>
  </Modal>
);
