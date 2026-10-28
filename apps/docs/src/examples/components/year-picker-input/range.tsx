import { YearPickerInput, createDay } from '@solid-slopkit/components/dates';

export default function Range() {
  return (
    <YearPickerInput
      label="Term"
      placeholder="First – last year"
      type="range"
      defaultValue={[createDay(2022, 0, 1), createDay(2026, 0, 1)]}
      name="term"
      style={{ 'max-width': '18rem' }}
    />
  );
}
