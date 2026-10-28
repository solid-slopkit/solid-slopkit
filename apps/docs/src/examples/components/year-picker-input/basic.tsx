import { createSignal } from 'solid-js';
import { YearPickerInput, createDay } from '@solid-slopkit/components/dates';

export default function Basic() {
  const [year, setYear] = createSignal<Date | null>(createDay(2026, 0, 1));

  return (
    <YearPickerInput
      label="Tax year"
      placeholder="Pick a year"
      value={year()}
      onChange={setYear}
      clearable
      style={{ 'max-width': '18rem' }}
    />
  );
}
