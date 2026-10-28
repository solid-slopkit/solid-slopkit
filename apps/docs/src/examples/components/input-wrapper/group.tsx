import { For } from 'solid-js';
import { InputWrapper, useInputWrapper } from '@solid-slopkit/components';

// A custom group reads the wrapper's ids and points at its label itself.
function PlanChoice() {
  const wrapper = useInputWrapper()!;
  return (
    <div role="radiogroup" aria-labelledby={wrapper.labelId()} aria-describedby={wrapper.describedBy()}>
      <For each={['Monthly', 'Yearly']}>
        {(plan) => (
          <label style={{ display: 'block' }}>
            <input type="radio" name="plan" value={plan} /> {plan}
          </label>
        )}
      </For>
    </div>
  );
}

export default function Group() {
  return (
    <InputWrapper label="Billing" description="You can change it later." labelElement="div">
      <PlanChoice />
    </InputWrapper>
  );
}
