import { Code, CopyButton, Group } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Group gap={2}>
      <Code>npm i @solid-slopkit/components</Code>
      <CopyButton value="npm i @solid-slopkit/components" size="sm" label="Copy the install command" />
    </Group>
  );
}
