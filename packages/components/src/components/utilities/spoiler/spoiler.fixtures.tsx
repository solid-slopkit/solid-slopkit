// SSR scenarios for spoiler.test.tsx.
import { Spoiler } from '.';

export const spoilers = () => (
  <div>
    <Spoiler maxHeight={40} class="mine">
      <p>A long text that is cut.</p>
      <p>A second paragraph.</p>
      <p>A third paragraph.</p>
    </Spoiler>
    <Spoiler defaultExpanded showLabel="More" hideLabel="Less">
      <p>Expanded from the start.</p>
    </Spoiler>
    <Spoiler expanded={false}>
      <p>Controlled.</p>
    </Spoiler>
  </div>
);
