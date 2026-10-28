import { Code } from '@solid-slopkit/components';

const source = `pnpm vitest run --project browser src/components/typography/code/code.browser.test.tsx --reporter verbose`;

export default function Scrolling() {
  return (
    <Code block style={{ width: '100%', 'max-width': '24rem' }}>
      {source}
    </Code>
  );
}
