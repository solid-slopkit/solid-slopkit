import { List } from '@solid-slopkit/components';

export default function Ordered() {
  return (
    <>
      <List ordered spacing="xs">
        <List.Item>Read the step's ID</List.Item>
        <List.Item>Implement only that step</List.Item>
        <List.Item>Tick its box in the same commit</List.Item>
      </List>
      <List ordered type="i" start={4}>
        <List.Item>Fourth</List.Item>
        <List.Item>Fifth</List.Item>
      </List>
    </>
  );
}
