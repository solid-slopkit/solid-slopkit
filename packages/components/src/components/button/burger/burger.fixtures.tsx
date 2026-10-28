// SSR scenarios for burger.test.tsx.
import { Burger } from '.';

export const burgers = () => (
  <div>
    <Burger class="mine" aria-controls="nav" />
    <Burger defaultOpened label="Menu" size="lg" />
    <Burger opened color="primary" variant="soft" />
    <Burger disabled />
  </div>
);
