import { createSignal } from 'solid-js';
import { Stack, Text } from '@solid-slopkit/components';
import { YearPicker, createDay, useFormatDate } from '@solid-slopkit/components/dates';

export default function Range() {
  const [range, setRange] = createSignal<[Date | null, Date | null]>([createDay(2027, 0, 1), createDay(2032, 0, 1)]);
  const format = useFormatDate();
  const label = (year: Date | null) => (year ? format(year, { year: 'numeric' }) : '…');

  return (
    <Stack align="center">
      <YearPicker type="range" numberOfColumns={2} value={range()} onChange={setRange} minDate={createDay(2022, 0, 1)} />
      <Text size="sm">
        {label(range()[0])} – {label(range()[1])}
      </Text>
    </Stack>
  );
}
