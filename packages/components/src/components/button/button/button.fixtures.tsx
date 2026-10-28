// SSR scenarios for button.test.tsx.
import { Button } from '.';

export const variants = () => (
  <div>
    <Button>Default</Button>
    <Button variant="soft" color="primary" size="lg" leftSection={<span>+</span>}>
      Soft
    </Button>
    <Button variant="outline" color="error" disabled>
      Disabled
    </Button>
    <Button loading rightSection={<span>→</span>}>
      Loading
    </Button>
    <Button shape="circle" aria-label="Add" active>
      +
    </Button>
    <Button as="a" href="/docs" fullWidth>
      Link
    </Button>
    <Button as="div" disabled>
      Div
    </Button>
  </div>
);
