import { Calendar, createDay } from '@solid-slopkit/components/dates';

// Weekdays from October 5 to November 20 only.
export default function Limits() {
  return (
    <Calendar
      defaultDate={createDay(2026, 9, 1)}
      minDate={createDay(2026, 9, 5)}
      maxDate={createDay(2026, 10, 20)}
      excludeDate={(date) => date.getDay() === 0 || date.getDay() === 6}
    />
  );
}
