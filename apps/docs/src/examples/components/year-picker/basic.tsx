import { createSignal } from 'solid-js';
import { Stack, Text } from '@solid-slopkit/components';
import { YearPicker, createDay, useFormatDate } from '@solid-slopkit/components/dates';

export default function Basic() {
  const [year, setYear] = createSignal<Date | null>(createDay(2026, 0, 1));
  const format = useFormatDate();

  return (
    <Stack align="center">
      <YearPicker value={year()} onChange={setYear} allowDeselect />
      <Text size="sm">{year() ? format(year()!, { year: 'numeric' }) : 'No year chosen'}</Text>
    </Stack>
  );
}
