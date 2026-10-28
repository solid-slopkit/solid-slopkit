// SSR scenarios for affix.test.tsx.
import { Affix } from '.';

export const affixes = () => (
  <div>
    <p>Page</p>
    <Affix>
      <button type="button">Back to top</button>
    </Affix>
    <Affix position="top" offset={8} class="mine">
      <span>Saved</span>
    </Affix>
  </div>
);
