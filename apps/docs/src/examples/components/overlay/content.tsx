import { Loader, Overlay, Paper, Text } from '@solid-slopkit/components';

export default function Content() {
  return (
    <Paper withBorder style={{ position: 'relative' }}>
      <Text>Monthly report: revenue, refunds and the ten largest orders, recalculated every night from the payments ledger.</Text>
      <Overlay color="neutral" backgroundOpacity={0.15} blur={2} center>
        <Loader label="Recalculating the report" />
      </Overlay>
    </Paper>
  );
}
