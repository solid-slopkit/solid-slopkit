import { Group, Stack, Text } from '@solid-slopkit/components';

export default function Figures() {
  return (
    <Group gap={8} align="flex-start">
      <Stack gap={1}>
        <Text size="xs" weight="medium" transform="uppercase" dimmed>
          Claimable balance
        </Text>
        <Text size="5xl" weight="semibold" tabularNums>
          $1,240.00
        </Text>
      </Stack>
      <Stack gap={1}>
        <Text size="sm" tabularNums align="end">
          $1,111.11
        </Text>
        <Text size="sm" tabularNums align="end">
          $988.40
        </Text>
        <Text size="sm" tabularNums align="end">
          $40.00
        </Text>
      </Stack>
    </Group>
  );
}
