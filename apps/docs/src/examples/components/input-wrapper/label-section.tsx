import { createSignal } from 'solid-js';
import { Anchor, Input, InputWrapper, Slider, Stack, Text } from '@solid-slopkit/components';

export default function LabelSection() {
  const [payout, setPayout] = createSignal(2500);

  return (
    <Stack gap={6} style={{ width: '20rem' }}>
      <InputWrapper label="Password" labelSection={<Anchor href="#reset">Forgot password?</Anchor>}>
        <Input type="password" />
      </InputWrapper>
      <Slider
        label="Minimum payout"
        labelSection={
          <Text as="span" size="2xl" weight="semibold" tabularNums aria-hidden="true">
            ${payout().toLocaleString('en-US')}
          </Text>
        }
        min={50}
        max={10000}
        value={payout()}
        onChange={setPayout}
        valueText={(value) => `$${value.toLocaleString('en-US')}`}
      />
    </Stack>
  );
}
