// SSR scenarios for format.test.tsx.
import { For } from 'solid-js';
import { SlopkitUi } from '../components/provider';
import { createDay, getWeekdayNames, getWeekInfo, useFormatDate } from '.';

const Probe = () => {
  const format = useFormatDate();
  return <p>{format(createDay(2026, 9, 15), { dateStyle: 'full' })}</p>;
};

export const formatted = () => (
  <SlopkitUi locale="de-DE">
    <Probe />
    <ul>
      <For each={getWeekdayNames('de-DE', getWeekInfo('de-DE').firstDayOfWeek)}>{(name) => <li>{name}</li>}</For>
    </ul>
  </SlopkitUi>
);
