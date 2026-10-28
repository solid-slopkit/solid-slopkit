import { createSignal } from 'solid-js';
import { Button, Group, Stack, Stepper, Text } from '@solid-slopkit/components';

export default function Basic() {
  const [active, setActive] = createSignal(1);
  const steps = 3;

  return (
    <Stack gap={6} style={{ width: '100%' }}>
      <Stepper active={active()} onStepClick={setActive}>
        <Stepper.Step label="Account" description="Create an account">
          <Text>Pick a name and a password.</Text>
        </Stepper.Step>
        <Stepper.Step label="Address" description="Where to ship">
          <Text>Tell us where the order goes.</Text>
        </Stepper.Step>
        <Stepper.Step label="Payment" description="Card or invoice">
          <Text>Choose how to pay.</Text>
        </Stepper.Step>
        <Stepper.Completed>
          <Text>Your order is on its way.</Text>
        </Stepper.Completed>
      </Stepper>
      <Group justify="center">
        <Button variant="outline" disabled={active() === 0} onClick={() => setActive((step) => step - 1)}>
          Back
        </Button>
        <Button disabled={active() === steps} onClick={() => setActive((step) => step + 1)}>
          Next
        </Button>
      </Group>
    </Stack>
  );
}
