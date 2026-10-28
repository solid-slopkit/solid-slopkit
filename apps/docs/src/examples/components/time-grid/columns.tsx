import { TimeGrid, getTimeRange } from '@solid-slopkit/components/dates';

export default function Columns() {
  return (
    <TimeGrid
      aria-label="Evening"
      data={getTimeRange({ start: '17:00', end: '21:45', interval: 15 })}
      format="24h"
      columns={4}
      size="sm"
      color="secondary"
      minTime="18:00"
      style={{ 'max-width': '24rem' }}
    />
  );
}
