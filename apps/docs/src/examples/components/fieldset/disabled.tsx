import { createSignal } from 'solid-js';
import { Button, Fieldset, Input, InputWrapper, Stack } from '@solid-slopkit/components';

export default function Disabled() {
  const [locked, setLocked] = createSignal(true);

  return (
    <Stack gap={3} align="flex-start" style={{ width: '100%', 'max-width': '24rem' }}>
      <Button size="sm" variant="outline" onClick={() => setLocked((value) => !value)}>
        {locked() ? 'Unlock' : 'Lock'} the payment fields
      </Button>
      <Fieldset legend="Payment" disabled={locked()} style={{ width: '100%' }}>
        <InputWrapper label="Card holder">
          <Input autocomplete="cc-name" />
        </InputWrapper>
        <InputWrapper label="Billing email">
          <Input type="email" autocomplete="email" />
        </InputWrapper>
      </Fieldset>
    </Stack>
  );
}
