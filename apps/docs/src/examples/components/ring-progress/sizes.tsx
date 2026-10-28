import { RingProgress } from '@solid-slopkit/components';
import { Check } from '@lucide/solid';

export default function Sizes() {
  return (
    <>
      <RingProgress value={60} size="xs" />
      <RingProgress value={60} size="sm" />
      <RingProgress value={60} size="md" />
      <RingProgress value={100} size="lg" color="success" label="Upload complete">
        <Check aria-hidden="true" color="var(--slp-color-success)" />
      </RingProgress>
      <RingProgress size="xl" label="Syncing" />
    </>
  );
}
