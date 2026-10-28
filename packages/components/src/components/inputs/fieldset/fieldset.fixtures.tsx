// SSR scenarios for fieldset.test.tsx.
import { Fieldset } from '.';
import { Input } from '../input';
import { InputWrapper } from '../input-wrapper';

export const fieldsets = () => (
  <div>
    <Fieldset legend="Shipping address" class="mine">
      <InputWrapper label="Street">
        <Input />
      </InputWrapper>
      <InputWrapper label="City">
        <Input />
      </InputWrapper>
    </Fieldset>
    <Fieldset legend="Locked" variant="soft" disabled>
      <InputWrapper label="Code">
        <Input />
      </InputWrapper>
    </Fieldset>
    <Fieldset variant="ghost" aria-label="No legend">
      <Input aria-label="Alone" />
    </Fieldset>
  </div>
);
