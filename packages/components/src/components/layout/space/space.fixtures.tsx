// SSR scenarios for space.test.tsx.
import { Space } from '.';

export const verticalAndHorizontal = () => (
  <div>
    <p>Above</p>
    <Space h={{ base: 4, md: 8 }} class="mine" />
    <p>Below</p>
    <Space w="2rem" />
    <Space />
  </div>
);
