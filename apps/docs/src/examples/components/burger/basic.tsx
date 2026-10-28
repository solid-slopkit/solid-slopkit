import { Burger, Group } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Group>
      <Burger />
      <Burger defaultOpened label="Menu" />
    </Group>
  );
}
