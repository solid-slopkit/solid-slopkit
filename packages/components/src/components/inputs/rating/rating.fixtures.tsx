// SSR scenarios for rating.test.tsx.
import { Rating } from '.';

export const ratings = () => (
  <div>
    <Rating label="Your rating" defaultValue={3} class="mine" />
    <Rating label="Half stars" fractions={2} value={2.5} color="error" size="lg" />
    <Rating aria-label="Average" readOnly value={4.3} />
    <Rating label="Disabled" disabled defaultValue={1} />
  </div>
);
