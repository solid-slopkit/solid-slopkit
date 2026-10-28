import { Anchor, Group } from '@solid-slopkit/components';

export default function Underline() {
  return (
    <Group gap={6}>
      <Anchor href="#always">{'underline="always"'}</Anchor>
      <Anchor href="#hover" underline="hover">
        {'underline="hover"'}
      </Anchor>
      <Anchor href="#never" underline="never">
        {'underline="never"'}
      </Anchor>
    </Group>
  );
}
