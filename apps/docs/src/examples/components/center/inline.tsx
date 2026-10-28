import { Center } from '@solid-slopkit/components';

export default function Inline() {
  return (
    <div>
      Text with an{' '}
      <Center
        inline
        style={{ width: '1.5rem', height: '1.5rem', 'border-radius': '50%', background: 'var(--slp-color-base-300)' }}
      >
        ★
      </Center>{' '}
      inline Center in the middle of it.
    </div>
  );
}
