import { createSignal } from 'solid-js';
import { Radio, Stack, Text } from '@solid-slopkit/components';

export default function Basic() {
  const [plan, setPlan] = createSignal('monthly');

  return (
    <div>
      <Radio.Group label="Plan" description="You can change it any time." value={plan()} onChange={setPlan}>
        <Stack gap={2} style={{ 'margin-top': '0.25rem' }}>
          <Radio value="monthly" label="Monthly" />
          <Radio value="yearly" label="Yearly" description="Two months free." />
          <Radio value="lifetime" label="Lifetime" description="Sold out." disabled />
        </Stack>
      </Radio.Group>
      <Text size="sm" dimmed style={{ 'margin-top': '0.5rem' }}>
        Value: {plan()}
      </Text>
    </div>
  );
}
