import { Pagination, Stack } from '@solid-slopkit/components';

export default function Options() {
  return (
    <Stack align="center">
      <Pagination total={30} defaultValue={15} withEdges siblings={2} />
      <Pagination total={30} defaultValue={15} boundaries={2} size="sm" color="secondary" />
      <Pagination total={30} defaultValue={15} withControls={false} size="xs" />
      <Pagination total={5} disabled />
    </Stack>
  );
}
