// SSR scenarios for pagination.test.tsx.
import { Pagination } from '.';

export const paginations = () => (
  <div>
    <Pagination total={10} defaultValue={5} class="mine" />
    <Pagination total={20} defaultValue={20} withEdges color="secondary" size="sm" siblings={2} />
    <Pagination total={8} getPageHref={(page) => `/results/${page}`} />
    <Pagination total={3} disabled />
    <Pagination total={1} hideWithOnePage />
  </div>
);
