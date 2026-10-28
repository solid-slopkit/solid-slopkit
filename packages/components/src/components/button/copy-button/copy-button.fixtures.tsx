// SSR scenarios for copy-button.test.tsx.
import { CopyButton } from '.';

export const copyButtons = () => (
  <div>
    <CopyButton value="npm i @solid-slopkit/components" class="mine" />
    <CopyButton value="https://example.com" label="Copy link" variant="soft" color="primary" size="sm" />
    <CopyButton value="secret" disabled />
  </div>
);
