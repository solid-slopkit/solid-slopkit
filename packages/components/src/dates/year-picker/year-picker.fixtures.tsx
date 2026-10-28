// SSR scenarios for year-picker.test.tsx. Each passes its date: today depends on the time zone.
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { YearPicker } from '.';

export const single = () => (
  <SlopkitUi>
    <YearPicker defaultValue={createDay(2026, 0, 1)} />
  </SlopkitUi>
);

export const multiple = () => (
  <SlopkitUi locale="de-DE">
    <YearPicker type="multiple" defaultValue={[createDay(2021, 0, 1), createDay(2026, 0, 1)]} />
  </SlopkitUi>
);

export const range = () => (
  <SlopkitUi>
    <YearPicker
      type="range"
      numberOfColumns={2}
      defaultValue={[createDay(2027, 0, 1), createDay(2032, 0, 1)]}
      minDate={createDay(2022, 5, 1)}
    />
  </SlopkitUi>
);
