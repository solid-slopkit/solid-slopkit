// SSR scenarios for date-picker.test.tsx. Each passes its date: today depends on the time zone.
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { DatePicker } from '.';

export const single = () => (
  <SlopkitUi>
    <DatePicker defaultValue={createDay(2026, 9, 15)} />
  </SlopkitUi>
);

export const multiple = () => (
  <SlopkitUi locale="de-DE">
    <DatePicker type="multiple" defaultValue={[createDay(2026, 9, 2), createDay(2026, 9, 20)]} />
  </SlopkitUi>
);

export const range = () => (
  <SlopkitUi>
    <DatePicker
      type="range"
      numberOfColumns={2}
      defaultValue={[createDay(2026, 9, 28), createDay(2026, 10, 3)]}
      minDate={createDay(2026, 9, 5)}
    />
  </SlopkitUi>
);
