import { createSignal } from 'solid-js';
import { Stack, Text } from '@solid-slopkit/components';
import { DateInput, createDay, useFormatDate } from '@solid-slopkit/components/dates';

export default function Basic() {
  const [day, setDay] = createSignal<Date | null>(createDay(2026, 9, 15));
  const format = useFormatDate();

  return (
    <Stack style={{ 'max-width': '18rem' }}>
      <DateInput label="Start date" placeholder="MM/DD/YYYY" value={day()} onChange={setDay} clearable />
      <Text size="sm">{day() ? format(day()!, { dateStyle: 'full' }) : 'No day'}</Text>
    </Stack>
  );
}
