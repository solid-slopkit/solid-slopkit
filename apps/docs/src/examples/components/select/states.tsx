import { Globe } from '@lucide/solid';
import { Select, Stack } from '@solid-slopkit/components';

const sizes = ['Small', 'Medium', 'Large'];

export default function States() {
  return (
    <Stack style={{ width: '16rem' }}>
      <Select
        label="Language"
        leftSection={<Globe />}
        variant="soft"
        data={['English', 'Deutsch', 'Français']}
        defaultValue="English"
      />
      <Select
        label="Size"
        description="Pick the size you usually wear"
        error="Choose a size"
        required
        data={sizes}
        placeholder="Pick one"
      />
      <Select label="Read only" readOnly data={sizes} defaultValue="Medium" />
      <Select label="Disabled" disabled data={sizes} placeholder="Not available" />
    </Stack>
  );
}
