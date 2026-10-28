// SSR scenarios for group.test.tsx.
import { Group } from '.';

export const defaultsAndGrow = () => (
  <Group class="mine">
    <span>a</span>
    <Group grow preventGrowOverflow={false} gap={2} justify="space-between" wrap="nowrap">
      <span>b</span>
      <span>c</span>
    </Group>
  </Group>
);
