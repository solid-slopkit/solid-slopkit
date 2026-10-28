// SSR scenarios for time-grid.test.tsx.
import { SlopkitUi } from '../../components/provider';
import { getTimeRange } from '../time';
import { TimeGrid } from '.';

export const grids = () => (
  <SlopkitUi>
    <TimeGrid aria-label="Slots" data={getTimeRange({ start: '09:00', end: '11:00', interval: 30 })} defaultValue="10:00" />
    <TimeGrid
      aria-label="Afternoon"
      data={['13:00', '14:00', '15:00', '16:00']}
      format="24h"
      columns={2}
      maxTime="15:00"
      disableTime={['14:00']}
      color="secondary"
      size="sm"
    />
  </SlopkitUi>
);

export const german = () => (
  <SlopkitUi locale="de-DE">
    <TimeGrid aria-label="Zeiten" data={['08:00', '20:30']} defaultValue="20:30" />
  </SlopkitUi>
);
