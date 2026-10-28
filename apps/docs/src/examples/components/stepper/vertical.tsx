import { createSignal } from 'solid-js';
import { Stepper } from '@solid-slopkit/components';

export default function Vertical() {
  const [active, setActive] = createSignal(1);

  return (
    <Stepper active={active()} onStepClick={setActive} allowNextStepsSelect={false} orientation="vertical">
      <Stepper.Step label="Order placed" description="Monday, 9:41" />
      <Stepper.Step label="Packed" description="In the warehouse" />
      <Stepper.Step label="Shipped" description="Two to four days" />
      <Stepper.Step label="Delivered" />
    </Stepper>
  );
}
