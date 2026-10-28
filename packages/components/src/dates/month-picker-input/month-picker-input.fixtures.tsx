// SSR scenarios for month-picker-input.test.tsx. Each passes its months: today depends on the time zone.
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { MonthPickerInput } from '.';

export const fields = () => (
  <SlopkitUi>
    <MonthPickerInput label="Month" placeholder="Pick a month" />
    <MonthPickerInput label="Chosen" name="month" defaultValue={createDay(2026, 9, 1)} clearable />
    <MonthPickerInput label="Months" type="multiple" defaultValue={[createDay(2026, 1, 1), createDay(2026, 5, 1)]} />
    <MonthPickerInput label="Season" type="range" defaultValue={[createDay(2026, 5, 1), createDay(2026, 7, 1)]} required />
  </SlopkitUi>
);
