import { Paper, ScrollArea } from '@solid-slopkit/components';

const log = Array.from(
  { length: 12 },
  (_, index) =>
    `2026-10-14T08:${String(index).padStart(2, '0')}:00Z  GET /api/orders?page=${index + 1}&size=50&sort=created_at  200  ${12 + index * 3}ms  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/537.36"`,
).join('\n');

export default function Directions() {
  return (
    // The preview lays examples out in a flex row: without min-width: 0, a flex item grows to the width of its content
    // instead of letting the ScrollArea scroll it.
    <Paper withBorder padding="none" style={{ width: '100%', 'min-width': 0 }}>
      <ScrollArea style={{ height: '160px' }}>
        <pre style={{ margin: 0, padding: '0.75rem 1rem' }}>{log}</pre>
      </ScrollArea>
    </Paper>
  );
}
