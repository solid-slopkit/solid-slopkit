import { Calendar, compareDays, createDay, isSameDay } from '@solid-slopkit/components/dates';

const start = createDay(2026, 9, 26);
const end = createDay(2026, 10, 6);

// A range drawn with getDayProps; the date pickers fill it in from the user's clicks.
export default function Range() {
  return (
    <Calendar
      defaultDate={createDay(2026, 9, 1)}
      numberOfColumns={2}
      getDayProps={(date) => ({
        inRange: compareDays(date, start) >= 0 && compareDays(date, end) <= 0,
        firstInRange: isSameDay(date, start),
        lastInRange: isSameDay(date, end),
      })}
    />
  );
}
