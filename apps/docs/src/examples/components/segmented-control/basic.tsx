import { SegmentedControl } from '@solid-slopkit/components';

export default function Basic() {
  return <SegmentedControl aria-label="Theme" data={['Light', 'Dark', 'System']} />;
}
