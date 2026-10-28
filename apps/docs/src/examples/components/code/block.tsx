import { Code } from '@solid-slopkit/components';

const source = `import { Code } from '@solid-slopkit/components';

export function Snippet() {
  return <Code block>{'const answer = 42;'}</Code>;
}`;

export default function Block() {
  return (
    <Code block style={{ width: '100%' }}>
      {source}
    </Code>
  );
}
