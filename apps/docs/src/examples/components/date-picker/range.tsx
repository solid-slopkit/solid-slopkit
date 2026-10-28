import { createSignal } from 'solid-js';
import { Stack, Text } from '@solid-slopkit/components';
import { DatePicker, createDay, useFormatDate } from '@solid-slopkit/components/dates';

export default function Range() {
  const [range, setRange] = createSignal<[Date | null, Date | null]>([createDay(2026, 9, 26), createDay(2026, 10, 4)]);
  const format = useFormatDate();
  const label = (day: Date | null) => (day ? format(day, { month: 'short', day: 'numeric' }) : '…');

  return (
    <Stack align="center">
      <DatePicker type="range" numberOfColumns={2} value={range()} onChange={setRange} minDate={createDay(2026, 9, 5)} />
      <Text size="sm">
        {label(range()[0])} – {label(range()[1])}
      </Text>
    </Stack>
  );
}
