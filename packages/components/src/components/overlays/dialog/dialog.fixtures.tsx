// SSR scenarios for dialog.test.tsx.
import { Dialog } from '.';

export const closed = () => (
  <div>
    <p>Page</p>
    <Dialog opened={false} aria-label="Feedback">
      <p>Not rendered</p>
    </Dialog>
  </div>
);

export const open = () => (
  <Dialog opened aria-label="Feedback" position="top-left" size="lg" class="mine">
    <p>Rendered on the server, shown once hydrated.</p>
  </Dialog>
);
