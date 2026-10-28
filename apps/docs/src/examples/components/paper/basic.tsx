import { Paper, Text, Title } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Paper withBorder shadow="sm" style={{ 'max-width': '24rem' }}>
      <Title order={3} size="h5">
        Billing
      </Title>
      <Text size="sm" dimmed>
        Your next invoice is due on the 1st.
      </Text>
    </Paper>
  );
}
