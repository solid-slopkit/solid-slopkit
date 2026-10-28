// SSR scenarios for visually-hidden.test.tsx.
import { VisuallyHidden } from '.';

export const label = () => (
  <button type="button">
    <span aria-hidden="true">×</span>
    <VisuallyHidden class="mine">Close</VisuallyHidden>
  </button>
);

export const heading = () => (
  <section aria-labelledby="results">
    <VisuallyHidden as="h2" id="results">
      Search results
    </VisuallyHidden>
    <p>Three matches.</p>
  </section>
);
