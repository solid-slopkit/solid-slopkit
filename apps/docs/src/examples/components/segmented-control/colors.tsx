import { SegmentedControl } from '@solid-slopkit/components';

export default function Colors() {
  return (
    <>
      <SegmentedControl aria-label="Default" data={['Day', 'Week', 'Month']} />
      <SegmentedControl aria-label="Primary" data={['Day', 'Week', 'Month']} color="primary" />
      <SegmentedControl aria-label="Neutral" data={['Day', 'Week', 'Month']} color="neutral" withItemsBorders={false} />
    </>
  );
}
