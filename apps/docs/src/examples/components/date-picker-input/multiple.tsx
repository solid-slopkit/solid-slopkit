import { DatePickerInput, createDay } from '@solid-slopkit/components/dates';

export default function Multiple() {
  return (
    <DatePickerInput
      label="Office days"
      type="multiple"
      defaultValue={[createDay(2026, 9, 6), createDay(2026, 9, 8)]}
      valueFormat={{ weekday: 'short', day: 'numeric', month: 'short' }}
      excludeDate={(date) => date.getDay() === 0 || date.getDay() === 6}
      style={{ 'max-width': '18rem' }}
    />
  );
}
