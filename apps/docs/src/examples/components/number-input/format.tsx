import { NumberInput, Stack } from '@solid-slopkit/components';

export default function Format() {
  return (
    <Stack gap={3} style={{ width: '100%', 'max-width': '16rem' }}>
      <NumberInput
        label="Price"
        defaultValue={1234.5}
        decimalScale={2}
        fixedDecimalScale
        min={0}
        rightSection={<span>USD</span>}
      />
      <NumberInput
        label="Preis"
        locale="de-DE"
        defaultValue={1234.5}
        decimalScale={2}
        fixedDecimalScale
        min={0}
        rightSection={<span>EUR</span>}
      />
      <NumberInput label="Seats" defaultValue={2} decimalScale={0} min={1} max={8} />
    </Stack>
  );
}
