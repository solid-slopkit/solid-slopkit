import { createSignal } from 'solid-js';
import { Pagination, Stack, Text } from '@solid-slopkit/components';

export default function Basic() {
  const [page, setPage] = createSignal(1);

  return (
    <Stack align="center">
      <Pagination total={20} value={page()} onChange={setPage} />
      <Text size="sm">Page {page()} of 20</Text>
    </Stack>
  );
}
