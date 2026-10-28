import { PinInput, Stack } from '@solid-slopkit/components';

export default function Options() {
  return (
    <Stack gap={4}>
      <PinInput label="PIN" length={6} mask variant="soft" />
      <PinInput label="Voucher" type="alphanumeric" length={5} variant="ghost" size="sm" />
    </Stack>
  );
}
