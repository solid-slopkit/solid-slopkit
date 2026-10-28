import { Anchor, Group } from '@solid-slopkit/components';

export default function Variants() {
  return (
    <Group gap={6}>
      <Anchor href="#size" size="lg" weight="semibold">
        {'size="lg" weight="semibold"'}
      </Anchor>
      <Anchor href="#color" color="secondary">
        {'color="secondary"'}
      </Anchor>
      <Anchor href="#dimmed" color="neutral" dimmed underline="hover">
        neutral, dimmed
      </Anchor>
    </Group>
  );
}
