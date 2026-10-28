import { Stack, Text } from '@solid-slopkit/components';

export default function Polymorphic() {
  return (
    <Stack gap={2}>
      <Text as="label" for="email" size="sm" weight="medium">
        Email
      </Text>
      <input id="email" type="email" />
      <Text size="lg">
        Total:{' '}
        <Text as="span" inherit weight="bold" color="primary">
          €42.00
        </Text>
      </Text>
    </Stack>
  );
}
