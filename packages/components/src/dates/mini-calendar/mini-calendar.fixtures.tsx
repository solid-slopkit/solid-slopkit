// SSR scenarios for mini-calendar.test.tsx. Each passes its date: today depends on the time zone.
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { MiniCalendar } from '.';

export const week = () => (
  <SlopkitUi locale="de-DE">
    <MiniCalendar defaultDate={createDay(2026, 9, 12)} defaultValue={createDay(2026, 9, 14)} />
  </SlopkitUi>
);

export const limited = () => (
  <SlopkitUi>
    <MiniCalendar
      defaultDate={createDay(2026, 9, 12)}
      numberOfDays={5}
      minDate={createDay(2026, 9, 13)}
      excludeDate={(date) => date.getDay() === 0}
      size="sm"
      color="secondary"
    />
  </SlopkitUi>
);
