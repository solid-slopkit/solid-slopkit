import { createSignal } from 'solid-js';
import { DatePickerInput, createDay } from '@solid-slopkit/components/dates';

export default function Basic() {
  const [day, setDay] = createSignal<Date | null>(createDay(2026, 9, 15));

  return (
    <DatePickerInput
      label="Due date"
      description="When the invoice has to be paid"
      placeholder="Pick a day"
      value={day()}
      onChange={setDay}
      clearable
      style={{ 'max-width': '18rem' }}
    />
  );
}
