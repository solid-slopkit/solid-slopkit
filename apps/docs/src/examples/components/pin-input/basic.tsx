import { createSignal } from 'solid-js';
import { PinInput, Text } from '@solid-slopkit/components';

export default function Basic() {
  const [status, setStatus] = createSignal('');

  return (
    <div>
      <PinInput
        label="Verification code"
        description="Type the 4 digits we sent you. 1234 works."
        error={status() === 'wrong' ? 'That code is wrong. Try again.' : undefined}
        onChange={() => setStatus('')}
        onComplete={(code) => setStatus(code === '1234' ? 'right' : 'wrong')}
      />
      <Text size="sm" dimmed role="status" style={{ 'margin-top': '0.5rem' }}>
        {status() === 'right' ? 'Verified.' : ''}
      </Text>
    </div>
  );
}
