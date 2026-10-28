import { Group, Kbd } from '@solid-slopkit/components';

export default function Sizes() {
  return (
    <Group gap={2}>
      <Kbd size="xs">Shift</Kbd>
      <Kbd size="sm">Shift</Kbd>
      <Kbd size="md">Shift</Kbd>
      <Kbd size="lg">Shift</Kbd>
      <Kbd size="xl">Shift</Kbd>
    </Group>
  );
}
