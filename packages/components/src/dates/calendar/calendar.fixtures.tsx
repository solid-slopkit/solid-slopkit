// SSR scenarios for calendar.test.tsx. Each passes its date: today depends on the time zone.
import { SlopkitUi } from '../../components/provider';
import { createDay, isSameDay } from '../date';
import { Calendar } from '.';

const october15 = createDay(2026, 9, 15);

export const month = () => (
  <SlopkitUi locale="de-DE">
    <Calendar
      defaultDate={october15}
      minDate={createDay(2026, 9, 3)}
      excludeDate={(date) => date.getDay() === 0}
      getDayProps={(date) => ({ selected: isSameDay(date, october15) })}
      renderDay={(date) => <span>{date.getDate()}</span>}
    />
  </SlopkitUi>
);

export const year = () => (
  <SlopkitUi>
    <Calendar defaultDate={october15} defaultLevel="year" getMonthProps={(date) => ({ selected: date.getMonth() === 9 })} />
  </SlopkitUi>
);

export const decade = () => (
  <SlopkitUi>
    <Calendar defaultDate={october15} defaultLevel="decade" maxDate={createDay(2027, 5, 1)} />
  </SlopkitUi>
);

export const columns = () => (
  <SlopkitUi>
    <Calendar defaultDate={october15} numberOfColumns={2} hideOutsideDates hideWeekdays size="sm" color="secondary" />
  </SlopkitUi>
);
