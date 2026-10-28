// SSR scenarios for pin-input.test.tsx.
import { PinInput } from '.';

export const pinInputs = () => (
  <div>
    <PinInput label="Code" description="We sent it by text message." class="mine" />
    <PinInput label="PIN" length={6} mask defaultValue="12" name="pin" variant="soft" size="lg" />
    <PinInput label="Voucher" type="alphanumeric" error="That code has expired." value="AB12" />
  </div>
);
