import { createSignal } from 'solid-js';
import { Stack, Text } from '@solid-slopkit/components';
import { TimeGrid, getTimeRange } from '@solid-slopkit/components/dates';

export default function Basic() {
  const [slot, setSlot] = createSignal<string | null>('10:30');

  return (
    <Stack style={{ 'max-width': '22rem' }}>
      <TimeGrid
        aria-label="Free slots"
        data={getTimeRange({ start: '09:00', end: '13:00', interval: 30 })}
        value={slot()}
        onChange={setSlot}
        disableTime={['11:00', '11:30']}
        allowDeselect
      />
      <Text size="sm">Value: {slot() ?? '—'}</Text>
    </Stack>
  );
}
