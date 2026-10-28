// SSR scenarios for list.test.tsx.
import { List } from '.';

const Dot = () => <svg aria-hidden="true" viewBox="0 0 10 10" />;

export const lists = () => (
  <div>
    <List class="mine" spacing="sm">
      <List.Item>First</List.Item>
      <List.Item>
        Second, with a nested list
        <List ordered>
          <List.Item>Nested</List.Item>
        </List>
      </List.Item>
    </List>
    <List icon={<Dot />} size="sm">
      <List.Item>Shared icon</List.Item>
      <List.Item icon={<span aria-hidden="true">★</span>}>Own icon</List.Item>
      <List.Item icon={null}>No icon</List.Item>
    </List>
  </div>
);
