import { DatePickerInput, createDay } from '@solid-slopkit/components/dates';

export default function Range() {
  return (
    <DatePickerInput
      label="Stay"
      placeholder="Arrival – departure"
      type="range"
      numberOfColumns={2}
      defaultValue={[createDay(2026, 9, 12), createDay(2026, 9, 16)]}
      minDate={createDay(2026, 9, 5)}
      name="stay"
      style={{ 'max-width': '18rem' }}
    />
  );
}
