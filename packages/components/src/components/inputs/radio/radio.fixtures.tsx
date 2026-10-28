// SSR scenarios for radio.test.tsx.
import { Radio } from '.';

export const radios = () => (
  <div>
    <Radio.Group label="Plan" description="Change it any time." defaultValue="monthly" name="plan" class="mine">
      <Radio value="monthly" label="Monthly" />
      <Radio value="yearly" label="Yearly" description="Two months free." />
      <Radio value="lifetime" label="Lifetime" disabled />
    </Radio.Group>
    <Radio.Group label="Size" error="Pick a size." required size="lg">
      <Radio value="s" label="Small" color="success" />
    </Radio.Group>
    <Radio.Group label="Delivery" value="fast">
      <Radio.Card value="standard">Standard</Radio.Card>
      <Radio.Card value="fast">Fast</Radio.Card>
    </Radio.Group>
    <Radio label="Alone" defaultChecked />
  </div>
);
