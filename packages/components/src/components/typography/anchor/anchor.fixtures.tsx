// SSR scenarios for anchor.test.tsx.
import { Anchor } from '.';

export const links = () => (
  <p>
    Read the <Anchor href="/terms">terms</Anchor>, the{' '}
    <Anchor href="/faq" underline="hover" size="sm" color="secondary" class="mine">
      FAQ
    </Anchor>{' '}
    or{' '}
    <Anchor href="/blog" underline="never" weight="bold">
      blog
    </Anchor>
    .
  </p>
);
