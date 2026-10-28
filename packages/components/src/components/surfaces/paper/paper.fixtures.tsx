// SSR scenarios for paper.test.tsx.
import { Paper } from '.';

export const variants = () => (
  <div>
    <Paper>Default</Paper>
    <Paper shadow="md" withBorder class="mine">
      Shadow and border
    </Paper>
    <Paper surface="base-200" padding="xl">
      <Paper surface="base-100" padding="sm" radius="none">
        Nested
      </Paper>
    </Paper>
  </div>
);
