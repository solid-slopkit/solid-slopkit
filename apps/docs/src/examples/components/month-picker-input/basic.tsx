import { createSignal } from 'solid-js';
import { MonthPickerInput, createDay } from '@solid-slopkit/components/dates';

export default function Basic() {
  const [month, setMonth] = createSignal<Date | null>(createDay(2026, 9, 1));

  return (
    <MonthPickerInput
      label="Billing month"
      placeholder="Pick a month"
      value={month()}
      onChange={setMonth}
      clearable
      style={{ 'max-width': '18rem' }}
    />
  );
}
