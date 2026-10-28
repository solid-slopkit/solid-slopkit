import { MonthPickerInput, createDay } from '@solid-slopkit/components/dates';

export default function Range() {
  return (
    <MonthPickerInput
      label="Season"
      placeholder="First – last month"
      type="range"
      defaultValue={[createDay(2026, 5, 1), createDay(2026, 7, 1)]}
      valueFormat={{ month: 'short', year: 'numeric' }}
      name="season"
      style={{ 'max-width': '18rem' }}
    />
  );
}
