import { ColorInput, Stack } from '@solid-slopkit/components';

export default function States() {
  return (
    <Stack style={{ width: '16rem' }}>
      <ColorInput label="Without a picker" withPicker={false} variant="soft" defaultValue="#2f9e44" />
      <ColorInput label="Accent" size="sm" error="Pick an accent color" required placeholder="#rrggbb" />
      <ColorInput label="Read only" readOnly defaultValue="#7048e8" />
      <ColorInput label="Disabled" disabled defaultValue="#868e96" />
    </Stack>
  );
}
