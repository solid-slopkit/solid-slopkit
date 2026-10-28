// SSR scenarios for stepper.test.tsx.
import { Stepper } from '.';

export const steppers = () => (
  <div>
    <Stepper active={1} class="mine">
      <Stepper.Step label="One" description="First" completedIcon={<span>ok</span>}>
        First content
      </Stepper.Step>
      <Stepper.Step label="Two" icon={<span>2!</span>}>
        Second content
      </Stepper.Step>
      <Stepper.Step label="Three" loading>
        Third content
      </Stepper.Step>
      <Stepper.Completed>Done</Stepper.Completed>
    </Stepper>
    <Stepper active={2} orientation="vertical" onStepClick={() => {}} allowNextStepsSelect={false} color="success">
      <Stepper.Step label="A" />
      <Stepper.Step label="B" />
      <Stepper.Completed>Finished</Stepper.Completed>
    </Stepper>
  </div>
);
