import { Anchor, Divider, Group } from '@solid-slopkit/components';

export default function Vertical() {
  return (
    <Group gap={3}>
      <Anchor href="#docs" underline="hover">
        Docs
      </Anchor>
      <Divider orientation="vertical" />
      <Anchor href="#blog" underline="hover">
        Blog
      </Anchor>
      <Divider orientation="vertical" />
      <Anchor href="#changelog" underline="hover">
        Changelog
      </Anchor>
    </Group>
  );
}
