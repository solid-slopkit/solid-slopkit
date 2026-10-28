import { CloseButton, Group } from '@solid-slopkit/components';

export default function Sizes() {
  return (
    <Group>
      <CloseButton size="xs" />
      <CloseButton size="sm" />
      <CloseButton size="md" />
      <CloseButton size="lg" />
      <CloseButton size="xl" />
    </Group>
  );
}
