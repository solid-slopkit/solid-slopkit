import { Stack } from '@solid-slopkit/components';
import { MiniCalendar, createDay } from '@solid-slopkit/components/dates';

export default function Options() {
  return (
    <Stack align="center">
      <MiniCalendar
        defaultDate={createDay(2026, 9, 12)}
        numberOfDays={5}
        minDate={createDay(2026, 9, 13)}
        maxDate={createDay(2026, 10, 6)}
        excludeDate={(date) => date.getDay() === 0 || date.getDay() === 6}
        color="secondary"
      />
      <MiniCalendar defaultDate={createDay(2026, 9, 12)} numberOfDays={4} size="sm" locale="de-DE" />
      <MiniCalendar defaultDate={createDay(2026, 9, 12)} numberOfDays={3} size="lg" />
    </Stack>
  );
}
