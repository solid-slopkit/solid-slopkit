// SSR scenarios for title.test.tsx.
import { Title } from '.';

export const levels = () => (
  <div>
    <Title>Page</Title>
    <Title order={2} color="primary" class="mine">
      Section
    </Title>
    <Title order={3} size="h5" dimmed weight="medium">
      Subsection
    </Title>
    <Title order={6}>Smallest</Title>
  </div>
);
