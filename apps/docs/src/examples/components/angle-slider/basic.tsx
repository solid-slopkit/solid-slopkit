import { createSignal } from 'solid-js';
import { AngleSlider, Group } from '@solid-slopkit/components';

export default function Basic() {
  const [angle, setAngle] = createSignal(135);

  return (
    <Group gap={6} align="center">
      <AngleSlider label="Gradient angle" value={angle()} onChange={setAngle} size="lg" />
      <div
        role="img"
        aria-label={`A gradient at ${angle()} degrees`}
        style={{
          width: '8rem',
          height: '5rem',
          'border-radius': '0.75rem',
          background: `linear-gradient(${angle()}deg, var(--slp-color-primary), var(--slp-color-secondary))`,
        }}
      />
    </Group>
  );
}
