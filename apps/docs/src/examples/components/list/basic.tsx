import { List } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <List spacing="xs">
      <List.Item>Install the package from npm</List.Item>
      <List.Item>Import the stylesheet and a theme</List.Item>
      <List.Item>Wrap the app in the provider</List.Item>
    </List>
  );
}
