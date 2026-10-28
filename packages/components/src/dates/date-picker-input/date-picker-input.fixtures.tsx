// SSR scenarios for date-picker-input.test.tsx. Each passes its days: today depends on the time zone.
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { DatePickerInput } from '.';

export const fields = () => (
  <SlopkitUi>
    <DatePickerInput label="Day" placeholder="Pick a day" class="mine" />
    <DatePickerInput label="Chosen" name="day" defaultValue={createDay(2026, 9, 15)} clearable />
    <DatePickerInput
      label="Days"
      type="multiple"
      defaultValue={[createDay(2026, 9, 2), createDay(2026, 9, 20)]}
      valueFormat={{ month: 'short', day: 'numeric' }}
    />
    <DatePickerInput label="Stay" type="range" defaultValue={[createDay(2026, 9, 12), createDay(2026, 9, 16)]} required />
    <DatePickerInput label="Locked" disabled defaultValue={createDay(2026, 9, 15)} error="Not now" />
  </SlopkitUi>
);

export const german = () => (
  <SlopkitUi locale="de-DE">
    <DatePickerInput label="Tag" defaultValue={createDay(2026, 9, 15)} valueFormat={{ dateStyle: 'long' }} />
  </SlopkitUi>
);
