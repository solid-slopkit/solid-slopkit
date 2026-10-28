// SSR scenarios for skeleton.test.tsx.
import { Skeleton } from '.';

export const skeletons = () => (
  <div>
    <Skeleton class="mine" style={{ height: '1rem', width: '60%' }} />
    <Skeleton circle style={{ width: '2.5rem', height: '2.5rem' }} animate={false} />
    <Skeleton>
      <p>Loaded text</p>
    </Skeleton>
    <Skeleton visible={false}>
      <p>Shown text</p>
    </Skeleton>
  </div>
);
