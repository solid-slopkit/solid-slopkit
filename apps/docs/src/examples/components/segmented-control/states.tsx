import { SegmentedControl } from '@solid-slopkit/components';

export default function States() {
  return (
    <>
      <SegmentedControl aria-label="Disabled" disabled data={['Disabled', 'B', 'C']} />
      <SegmentedControl aria-label="Read only" readOnly data={['Read only', 'B', 'C']} />
    </>
  );
}
