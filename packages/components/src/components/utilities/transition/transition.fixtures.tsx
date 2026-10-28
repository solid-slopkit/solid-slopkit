// SSR scenarios for transition.test.tsx.
import { Transition } from '.';

export const transitions = () => (
  <div>
    <Transition mounted transition="fade-up" duration={300} exitDuration={150} timingFunction="linear">
      {(transition) => <p {...transition}>Shown</p>}
    </Transition>
    <Transition mounted={false}>{(transition) => <p {...transition}>Not rendered</p>}</Transition>
    <Transition mounted={false} keepMounted transition="pop">
      {(transition) => <p {...transition}>Kept, hidden</p>}
    </Transition>
  </div>
);
