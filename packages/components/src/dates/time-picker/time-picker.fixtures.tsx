// SSR scenarios for time-picker.test.tsx.
import { SlopkitUi } from '../../components/provider';
import { TimePicker } from '.';

export const fields = () => (
  <SlopkitUi>
    <TimePicker label="Time" />
    <TimePicker label="Start" name="start" defaultValue="14:05" clearable required />
    <TimePicker label="Exact" withSeconds defaultValue="09:30:15" format="24h" withDropdown />
    <TimePicker label="Locked" disabled defaultValue="12:00" error="Not now" />
  </SlopkitUi>
);

export const german = () => (
  <SlopkitUi locale="de-DE">
    <TimePicker label="Zeit" defaultValue="21:45" />
  </SlopkitUi>
);
