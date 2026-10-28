import { For } from 'solid-js';
import { SegmentedControl } from '@solid-slopkit/components';

export default function Sizes() {
  return (
    <>
      <For each={['xs', 'sm', 'md', 'lg', 'xl'] as const}>
        {(size) => <SegmentedControl aria-label={`Size ${size}`} size={size} data={[size, 'Two', 'Three']} />}
      </For>
    </>
  );
}
