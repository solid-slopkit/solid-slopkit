import { createSignal } from 'solid-js';
import { Stack, Text } from '@solid-slopkit/components';
import { Calendar, createDay, useFormatDate, type CalendarLevel } from '@solid-slopkit/components/dates';

// A month picker: the months of a year, and above them the years of a decade.
export default function Levels() {
  const [month, setMonth] = createSignal<Date>();
  const [level, setLevel] = createSignal<CalendarLevel>('year');
  const format = useFormatDate();

  return (
    <Stack align="center">
      <Calendar
        defaultDate={createDay(2026, 9, 1)}
        minLevel="year"
        level={level()}
        onLevelChange={setLevel}
        getMonthProps={(date) => ({
          selected: !!month() && date.getFullYear() === month()!.getFullYear() && date.getMonth() === month()!.getMonth(),
        })}
        onMonthClick={setMonth}
      />
      <Text size="sm">
        Level: {level()} · {month() ? format(month()!, { month: 'long', year: 'numeric' }) : 'no month picked'}
      </Text>
    </Stack>
  );
}
