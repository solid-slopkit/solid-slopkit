// SSR scenarios for modals.test.tsx.
import { SlopkitUi } from '../../provider';
import { Modals } from '.';

export const host = () => (
  <SlopkitUi>
    <main>Page</main>
    <Modals centered size="sm" />
  </SlopkitUi>
);
