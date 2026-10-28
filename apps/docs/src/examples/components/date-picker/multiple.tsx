import { createSignal } from 'solid-js';
import { Stack, Text } from '@solid-slopkit/components';
import { DatePicker, createDay, useFormatDate } from '@solid-slopkit/components/dates';

export default function Multiple() {
  const [days, setDays] = createSignal([createDay(2026, 9, 6), createDay(2026, 9, 13)]);
  const format = useFormatDate();

  return (
    <Stack align="center">
      <DatePicker type="multiple" value={days()} onChange={setDays} defaultDate={createDay(2026, 9, 1)} color="secondary" />
      <Text size="sm">
        {days()
          .map((day) => format(day, { month: 'short', day: 'numeric' }))
          .join(', ') || 'No days chosen'}
      </Text>
    </Stack>
  );
}
