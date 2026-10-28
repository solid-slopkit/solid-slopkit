import { Slider, Stack } from '@solid-slopkit/components';

export default function Marks() {
  return (
    <Stack gap={6} style={{ width: '100%', 'max-width': '24rem' }}>
      <Slider
        label="T-shirt size"
        min={0}
        max={4}
        defaultValue={2}
        valueLabel={null}
        valueText={(value) => ['Extra small', 'Small', 'Medium', 'Large', 'Extra large'][value]}
        marks={[
          { value: 0, label: 'XS' },
          { value: 1, label: 'S' },
          { value: 2, label: 'M' },
          { value: 3, label: 'L' },
          { value: 4, label: 'XL' },
        ]}
      />
      <Slider label="Opacity" min={0} max={1} step={0.05} defaultValue={0.6} color="secondary" valueLabelAlwaysOn />
    </Stack>
  );
}
