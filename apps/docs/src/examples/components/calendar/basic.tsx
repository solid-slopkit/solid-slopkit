import { createSignal } from 'solid-js';
import { Stack, Text } from '@solid-slopkit/components';
import { Calendar, createDay, isSameDay, useFormatDate } from '@solid-slopkit/components/dates';

export default function Basic() {
  const [picked, setPicked] = createSignal<Date>();
  const format = useFormatDate();

  return (
    <Stack align="center">
      <Calendar
        defaultDate={createDay(2026, 9, 1)}
        getDayProps={(date) => ({ selected: !!picked() && isSameDay(date, picked()!) })}
        onDayClick={setPicked}
      />
      <Text size="sm">{picked() ? format(picked()!, { dateStyle: 'long' }) : 'Pick a day'}</Text>
    </Stack>
  );
}
