import { List } from '@solid-slopkit/components';

export default function Nested() {
  return (
    <List size="sm" spacing="xs">
      <List.Item>Layout</List.Item>
      <List.Item>
        Typography
        <List ordered>
          <List.Item>Text</List.Item>
          <List.Item>Title</List.Item>
          <List.Item>List</List.Item>
        </List>
      </List.Item>
      <List.Item>Inputs</List.Item>
    </List>
  );
}
