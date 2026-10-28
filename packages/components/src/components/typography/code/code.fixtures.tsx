// SSR scenarios for code.test.tsx.
import { Code } from '.';

export const inlineAndBlock = () => (
  <div>
    <p>
      Run <Code class="mine">pnpm install</Code> first.
    </p>
    <Code block>{`import { Code } from '@solid-slopkit/components';\n\nexport const answer = 42;`}</Code>
  </div>
);
