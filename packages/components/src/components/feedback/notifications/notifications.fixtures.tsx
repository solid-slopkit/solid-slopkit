// SSR scenarios for notifications.test.tsx.
import { SlopkitUi } from '../../provider';
import { Notifications } from '.';

export const region = () => (
  <SlopkitUi>
    <main>Page</main>
    <Notifications position="top-center" class="mine" />
  </SlopkitUi>
);
