import { List } from '@solid-slopkit/components';
import { CircleCheck, CircleX } from '@lucide/solid';

export default function Icons() {
  return (
    <List spacing="sm" icon={<CircleCheck aria-hidden="true" color="var(--slp-color-success)" />}>
      <List.Item>Keyboard and screen reader support</List.Item>
      <List.Item>Light and dark color schemes</List.Item>
      <List.Item>Server rendering with hydration</List.Item>
      <List.Item icon={<CircleX aria-hidden="true" color="var(--slp-color-error)" />}>Right-to-left layouts</List.Item>
    </List>
  );
}
