import { createSignal } from 'solid-js';
import { Stack, Text } from '@solid-slopkit/components';
import { TimePicker } from '@solid-slopkit/components/dates';

export default function Basic() {
  const [time, setTime] = createSignal('09:30');

  return (
    <Stack style={{ 'max-width': '14rem' }}>
      <TimePicker label="Meeting" value={time()} onChange={setTime} clearable />
      <Text size="sm">Value: {time() || '—'}</Text>
    </Stack>
  );
}
