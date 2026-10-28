import { Progress, Stack } from '@solid-slopkit/components';

export default function Variants() {
  return (
    <Stack gap={4} style={{ width: '100%' }}>
      <Progress value={60} size="xs" label="Extra small" />
      <Progress value={60} size="sm" label="Small" />
      <Progress value={60} label="Medium" />
      <Progress value={60} size="lg" striped label="Large, striped" />
      <Progress value={60} size="xl" animated color="success" label="Extra large, animated stripes" />
      <Progress label="Preparing" color="secondary" />
    </Stack>
  );
}
