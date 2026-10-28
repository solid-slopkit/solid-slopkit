import { Group, Indicator } from '@solid-slopkit/components';
import { Calendar, createDay } from '@solid-slopkit/components/dates';

const events = new Set([6, 13, 22]);

export default function Options() {
  return (
    <Group align="start" justify="center">
      <Calendar defaultDate={createDay(2026, 9, 1)} size="sm" locale="de-DE" hideOutsideDates fixedWeeks={false} />
      <Calendar
        defaultDate={createDay(2026, 9, 1)}
        size="sm"
        color="secondary"
        firstDayOfWeek={1}
        weekdayFormat="narrow"
        renderDay={(date) => (
          <Indicator size="xs" offset={2} disabled={date.getMonth() !== 9 || !events.has(date.getDate())}>
            {date.getDate()}
          </Indicator>
        )}
      />
    </Group>
  );
}
