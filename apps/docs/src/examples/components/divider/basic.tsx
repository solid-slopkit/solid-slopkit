import { Divider, Stack, Text } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Stack gap={3} style={{ width: '100%' }}>
      <Text>Account</Text>
      <Divider />
      <Text>Billing</Text>
      <Divider variant="dashed" />
      <Text>Notifications</Text>
      <Divider variant="dotted" color="primary" />
      <Text>Security</Text>
    </Stack>
  );
}
