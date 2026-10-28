import { NumberInput, Stack } from '@solid-slopkit/components';

export default function Step() {
  return (
    <Stack gap={3} style={{ width: '100%', 'max-width': '16rem' }}>
      <NumberInput
        label="Opacity"
        description="Steps of 0.05; Page Up and Down step 0.5."
        defaultValue={0.5}
        min={0}
        max={1}
        step={0.05}
      />
      <NumberInput label="Offset" description="No controls: the arrow keys still step." defaultValue={0} hideControls />
    </Stack>
  );
}
