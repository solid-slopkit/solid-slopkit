import { createSignal } from 'solid-js';
import { Clock } from '@lucide/solid';
import { Stack, Text } from '@solid-slopkit/components';
import { TimeInput } from '@solid-slopkit/components/dates';

export default function Basic() {
  const [time, setTime] = createSignal('09:30');

  return (
    <Stack style={{ 'max-width': '14rem' }}>
      <TimeInput
        label="Opens at"
        description="Between 8:00 and 18:00"
        value={time()}
        onChange={setTime}
        minTime="08:00"
        maxTime="18:00"
        leftSection={<Clock aria-hidden="true" />}
      />
      <Text size="sm">Value: {time() || '—'}</Text>
    </Stack>
  );
}
