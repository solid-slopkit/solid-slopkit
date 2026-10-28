import { SemiCircleProgress } from '@solid-slopkit/components';

export default function Sizes() {
  return (
    <>
      <SemiCircleProgress value={60} size="xs" />
      <SemiCircleProgress value={60} size="sm" color="secondary" />
      <SemiCircleProgress value={60} size="md" color="info" />
      <SemiCircleProgress value={60} size="lg" color="success" />
      <SemiCircleProgress size="xl" label="Measuring" />
    </>
  );
}
