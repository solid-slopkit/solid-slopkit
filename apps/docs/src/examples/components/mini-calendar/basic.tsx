import { createSignal } from 'solid-js';
import { Stack, Text } from '@solid-slopkit/components';
import { MiniCalendar, createDay, useFormatDate } from '@solid-slopkit/components/dates';

export default function Basic() {
  const [day, setDay] = createSignal(createDay(2026, 9, 14));
  const format = useFormatDate();

  return (
    <Stack align="center">
      <MiniCalendar value={day()} onChange={setDay} defaultDate={createDay(2026, 9, 12)} />
      <Text size="sm">Appointments on {format(day(), { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
    </Stack>
  );
}
