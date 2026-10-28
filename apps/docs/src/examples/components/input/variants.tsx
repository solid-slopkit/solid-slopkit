import { Input, Stack } from '@solid-slopkit/components';

export default function Variants() {
  return (
    <Stack gap={3} style={{ width: '100%', 'max-width': '20rem' }}>
      <Input aria-label="Outline" placeholder="Outline" />
      <Input aria-label="Soft" placeholder="Soft" variant="soft" />
      <Input aria-label="Ghost" placeholder="Ghost" variant="ghost" />
      <Input aria-label="Disabled" placeholder="Disabled" disabled />
    </Stack>
  );
}
