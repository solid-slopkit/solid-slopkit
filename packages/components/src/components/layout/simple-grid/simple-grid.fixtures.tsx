// SSR scenarios for simple-grid.test.tsx.
import { SimpleGrid } from '.';

export const responsive = () => (
  <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 2, sm: 4 }} verticalSpacing={8} class="mine">
    <span>a</span>
    <span>b</span>
    <SimpleGrid>
      <span>c</span>
    </SimpleGrid>
  </SimpleGrid>
);
