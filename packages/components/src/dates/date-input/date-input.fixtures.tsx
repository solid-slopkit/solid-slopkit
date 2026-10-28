// SSR scenarios for date-input.test.tsx. Each passes its days: today depends on the time zone.
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { DateInput } from '.';

export const fields = () => (
  <SlopkitUi>
    <DateInput label="Day" placeholder="MM/DD/YYYY" />
    <DateInput label="Chosen" name="day" defaultValue={createDay(2026, 9, 15)} clearable />
    <DateInput label="Long" defaultValue={createDay(2026, 9, 15)} valueFormat={{ dateStyle: 'long' }} required />
    <DateInput label="Locked" disabled defaultValue={createDay(2026, 9, 15)} error="Not now" />
  </SlopkitUi>
);

export const german = () => (
  <SlopkitUi locale="de-DE">
    <DateInput label="Tag" defaultValue={createDay(2026, 9, 15)} />
  </SlopkitUi>
);
