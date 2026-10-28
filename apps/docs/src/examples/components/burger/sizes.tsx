import { Burger, Group } from '@solid-slopkit/components';

export default function Sizes() {
  return (
    <Group>
      <Burger size="xs" />
      <Burger size="sm" />
      <Burger size="md" color="primary" />
      <Burger size="lg" variant="soft" color="primary" />
      <Burger size="xl" variant="outline" />
    </Group>
  );
}
