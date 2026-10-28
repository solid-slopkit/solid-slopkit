import { createSignal } from 'solid-js';
import { Stack, Text } from '@solid-slopkit/components';
import { MonthPicker, createDay, useFormatDate } from '@solid-slopkit/components/dates';

export default function Basic() {
  const [month, setMonth] = createSignal<Date | null>(createDay(2026, 9, 1));
  const format = useFormatDate();

  return (
    <Stack align="center">
      <MonthPicker value={month()} onChange={setMonth} allowDeselect />
      <Text size="sm">{month() ? format(month()!, { month: 'long', year: 'numeric' }) : 'No month chosen'}</Text>
    </Stack>
  );
}
