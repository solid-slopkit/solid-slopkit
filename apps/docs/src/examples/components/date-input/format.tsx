import { DateInput, createDay } from '@solid-slopkit/components/dates';

export default function Format() {
  return (
    <DateInput
      label="Delivery"
      description="Type a day, or pick a weekday"
      defaultValue={createDay(2026, 9, 20)}
      valueFormat={{ dateStyle: 'medium' }}
      minDate={createDay(2026, 9, 5)}
      excludeDate={(date) => date.getDay() === 0 || date.getDay() === 6}
      style={{ 'max-width': '18rem' }}
    />
  );
}
