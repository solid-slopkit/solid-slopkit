import { createSignal } from 'solid-js';
import { Stack, Text } from '@solid-slopkit/components';
import { YearPicker, createDay, useFormatDate } from '@solid-slopkit/components/dates';

export default function Multiple() {
  const [years, setYears] = createSignal([createDay(2022, 0, 1), createDay(2024, 0, 1)]);
  const format = useFormatDate();

  return (
    <Stack align="center">
      <YearPicker type="multiple" value={years()} onChange={setYears} color="secondary" />
      <Text size="sm">
        {years()
          .map((year) => format(year, { year: 'numeric' }))
          .join(', ') || 'No years chosen'}
      </Text>
    </Stack>
  );
}
