import { createSignal } from 'solid-js';
import { SegmentedControl } from '@solid-slopkit/components';

type View = 'list' | 'grid' | 'board';

export default function Controlled() {
  const [view, setView] = createSignal<View>('grid');

  return (
    <>
      <SegmentedControl
        aria-label="View"
        value={view()}
        onChange={setView}
        data={[
          { value: 'list', label: 'List' },
          { value: 'grid', label: 'Grid' },
          { value: 'board', label: 'Board', disabled: true },
        ]}
      />
      <span>Selected: {view()}</span>
    </>
  );
}
