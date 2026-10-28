// SSR scenarios for number-input.test.tsx.
import { NumberInput } from '.';

export const numberInputs = () => (
  <div>
    <NumberInput label="Quantity" defaultValue={3} min={0} max={10} class="mine" />
    <NumberInput label="Price" value={1234.5} decimalScale={2} fixedDecimalScale rightSection={<span>EUR</span>} locale="de-DE" />
    <NumberInput label="Offset" hideControls />
    <NumberInput label="Locked" defaultValue={1} disabled />
  </div>
);
