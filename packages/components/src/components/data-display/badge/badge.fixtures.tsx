// SSR scenarios for badge.test.tsx.
import { Badge } from '.';

export const variants = () => (
  <div>
    <Badge class="mine">Default</Badge>
    <Badge color="primary" variant="soft" size="sm">
      Soft
    </Badge>
    <Badge color="success" variant="outline" leftSection={<svg aria-hidden="true" />}>
      Outline
    </Badge>
    <Badge color="error" circle>
      3
    </Badge>
  </div>
);
