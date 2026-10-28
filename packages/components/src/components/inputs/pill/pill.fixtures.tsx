// SSR scenarios for pill.test.tsx.
import { Pill } from '.';

export const pills = () => (
  <div>
    <Pill class="mine">Plain</Pill>
    <Pill size="lg" color="primary" withRemoveButton removeLabel="Delete">
      Removable
    </Pill>
    <Pill.Group size="sm" color="success" disabled>
      <Pill withRemoveButton>In a group</Pill>
      <Pill>Another</Pill>
    </Pill.Group>
  </div>
);
