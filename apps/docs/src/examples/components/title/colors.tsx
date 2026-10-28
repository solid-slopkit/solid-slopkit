import { Stack, Text, Title } from '@solid-slopkit/components';

export default function Colors() {
  return (
    <Stack gap={2}>
      <Title order={3} color="primary">
        {'color="primary"'}
      </Title>
      <Title order={3} dimmed>
        dimmed
      </Title>
      <Title order={3} weight="medium">
        {'weight="medium"'}
      </Title>
      <Title order={3}>
        Plans from{' '}
        <Text as="span" inherit color="success">
          €9 a month
        </Text>
      </Title>
    </Stack>
  );
}
