import { Fieldset, Input, InputWrapper } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Fieldset legend="Shipping address" style={{ width: '100%', 'max-width': '24rem' }}>
      <InputWrapper label="Street">
        <Input autocomplete="street-address" />
      </InputWrapper>
      <InputWrapper label="City">
        <Input autocomplete="address-level2" />
      </InputWrapper>
    </Fieldset>
  );
}
