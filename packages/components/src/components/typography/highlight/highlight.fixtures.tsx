// SSR scenarios for highlight.test.tsx.
import { Highlight } from '.';

export const highlights = () => (
  <div>
    <p>
      <Highlight class="mine" highlight="theme">
        A Theme sets the tokens, and every theme has two schemes.
      </Highlight>
    </p>
    <p>
      <Highlight highlight={['color', 'role']} color="info">
        A color role names a color.
      </Highlight>
    </p>
    <p>
      <Highlight highlight="">Nothing to highlight</Highlight>
    </p>
  </div>
);
