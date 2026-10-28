// SSR scenarios for month-picker.test.tsx. Each passes its date: today depends on the time zone.
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { MonthPicker } from '.';

export const single = () => (
  <SlopkitUi>
    <MonthPicker defaultValue={createDay(2026, 9, 1)} />
  </SlopkitUi>
);

export const multiple = () => (
  <SlopkitUi locale="de-DE">
    <MonthPicker type="multiple" defaultValue={[createDay(2026, 1, 1), createDay(2026, 9, 1)]} />
  </SlopkitUi>
);

export const range = () => (
  <SlopkitUi>
    <MonthPicker
      type="range"
      numberOfColumns={2}
      defaultValue={[createDay(2026, 9, 1), createDay(2027, 2, 1)]}
      minDate={createDay(2026, 3, 1)}
    />
  </SlopkitUi>
);

export const decade = () => (
  <SlopkitUi>
    <MonthPicker defaultLevel="decade" defaultValue={createDay(2026, 9, 1)} />
  </SlopkitUi>
);
