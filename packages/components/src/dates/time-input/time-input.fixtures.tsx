// SSR scenarios for time-input.test.tsx.
import { SlopkitUi } from '../../components/provider';
import { TimeInput } from '.';

export const fields = () => (
  <SlopkitUi>
    <TimeInput label="Time" />
    <TimeInput label="Start" name="start" defaultValue="09:30" minTime="08:00" maxTime="18:00" required />
    <TimeInput label="Exact" withSeconds defaultValue="09:30:15" variant="soft" />
    <TimeInput label="Locked" disabled defaultValue="12:00" error="Not now" />
  </SlopkitUi>
);
