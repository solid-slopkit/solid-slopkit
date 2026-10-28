import { createSignal } from 'solid-js';
import { Pagination } from '@solid-slopkit/components';

export default function Links() {
  const [page, setPage] = createSignal(3);

  return (
    <Pagination
      total={8}
      value={page()}
      getPageHref={(number) => `#results-page-${number}`}
      onChange={setPage}
      aria-label="Search results pages"
    />
  );
}
