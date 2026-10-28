// SSR scenarios for date-time-picker.test.tsx. Each passes its dates: today depends on the time zone.
import { SlopkitUi } from '../../components/provider';
import { DateTimePicker } from '.';

export const fields = () => (
  <SlopkitUi>
    <DateTimePicker label="When" placeholder="Pick a date and time" />
    <DateTimePicker label="Chosen" name="when" defaultValue={new Date(2026, 9, 15, 9, 30)} clearable required />
    <DateTimePicker label="Exact" withSeconds defaultValue={new Date(2026, 9, 15, 9, 30, 15)} />
    <DateTimePicker label="Locked" disabled defaultValue={new Date(2026, 9, 15, 18, 0)} error="Not now" />
  </SlopkitUi>
);

export const german = () => (
  <SlopkitUi locale="de-DE">
    <DateTimePicker label="Termin" defaultValue={new Date(2026, 9, 15, 21, 45)} />
  </SlopkitUi>
);
