// SSR scenarios for kbd.test.tsx.
import { Kbd } from '.';

export const keys = () => (
  <p>
    Press <Kbd class="mine">Ctrl</Kbd> + <Kbd>K</Kbd>, or <Kbd size="lg">Esc</Kbd> to close.
  </p>
);
