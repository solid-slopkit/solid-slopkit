import { createSignal } from 'solid-js';
import { Stack, Text } from '@solid-slopkit/components';
import { DatePicker, createDay, useFormatDate } from '@solid-slopkit/components/dates';

export default function Basic() {
  const [day, setDay] = createSignal<Date | null>(createDay(2026, 9, 15));
  const format = useFormatDate();

  return (
    <Stack align="center">
      <DatePicker value={day()} onChange={setDay} allowDeselect />
      <Text size="sm">{day() ? format(day()!, { dateStyle: 'full' }) : 'No day chosen'}</Text>
    </Stack>
  );
}
