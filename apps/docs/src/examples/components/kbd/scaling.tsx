import { Kbd, Text, Title } from '@solid-slopkit/components';

export default function Scaling() {
  return (
    <>
      <Title order={3}>
        Open the palette with <Kbd>⌘</Kbd> <Kbd>K</Kbd>
      </Title>
      <Text>
        Save with <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd>
      </Text>
      <Text size="xs">
        Undo with <Kbd>Ctrl</Kbd> + <Kbd>Z</Kbd>
      </Text>
    </>
  );
}
