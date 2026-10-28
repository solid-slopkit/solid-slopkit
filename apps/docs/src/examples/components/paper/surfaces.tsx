import { Group, Paper, Stack } from '@solid-slopkit/components';

export default function Surfaces() {
  return (
    <Stack gap={4}>
      <Group gap={3}>
        <Paper withBorder>base-100</Paper>
        <Paper surface="base-200">base-200</Paper>
        <Paper surface="base-300">base-300</Paper>
      </Group>
      <Paper surface="base-200" padding="lg">
        <Paper radius="none" padding="sm">
          A base-100 Paper with no radius, on a base-200 Paper
        </Paper>
      </Paper>
    </Stack>
  );
}
