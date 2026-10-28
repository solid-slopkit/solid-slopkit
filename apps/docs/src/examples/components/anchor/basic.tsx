import { Anchor, Stack, Text } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Stack gap={2}>
      <Text>
        Read the <Anchor href="#terms">terms of service</Anchor> before you continue.
      </Text>
      <Text size="sm" dimmed>
        Smaller text keeps its size: <Anchor href="#privacy">privacy policy</Anchor>.
      </Text>
    </Stack>
  );
}
