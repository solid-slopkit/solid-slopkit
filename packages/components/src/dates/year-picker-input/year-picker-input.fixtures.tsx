// SSR scenarios for year-picker-input.test.tsx. Each passes its years: today depends on the time zone.
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { YearPickerInput } from '.';

export const fields = () => (
  <SlopkitUi>
    <YearPickerInput label="Year" placeholder="Pick a year" />
    <YearPickerInput label="Chosen" name="year" defaultValue={createDay(2026, 0, 1)} clearable />
    <YearPickerInput label="Years" type="multiple" defaultValue={[createDay(2021, 0, 1), createDay(2024, 0, 1)]} />
    <YearPickerInput label="Term" type="range" defaultValue={[createDay(2022, 0, 1), createDay(2026, 0, 1)]} required />
  </SlopkitUi>
);
