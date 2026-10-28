import { Group, RingProgress, Text } from '@solid-slopkit/components';

export default function Stroke() {
  return (
    <Group gap={8}>
      <RingProgress value={80} size="12rem" thickness={14} roundCaps={false} label="Savings goal">
        <Text as="span" size="2xl" weight="semibold" tabularNums>
          $24,000
        </Text>
        <Text as="span" size="xs" dimmed>
          80% of $30,000
        </Text>
      </RingProgress>
      <RingProgress value={60} size="lg" thickness={4} label="Storage used">
        <Text as="span" size="sm" weight="semibold">
          60%
        </Text>
      </RingProgress>
    </Group>
  );
}
