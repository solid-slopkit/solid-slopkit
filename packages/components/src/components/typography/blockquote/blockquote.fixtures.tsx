// SSR scenarios for blockquote.test.tsx.
import { Blockquote } from '.';

export const quotes = () => (
  <div>
    <Blockquote class="mine" cite="https://example.com/talk" attribution="— Ada Lovelace" color="primary">
      <p>The engine weaves algebraic patterns.</p>
    </Blockquote>
    <Blockquote>Plain text, with no attribution.</Blockquote>
  </div>
);
