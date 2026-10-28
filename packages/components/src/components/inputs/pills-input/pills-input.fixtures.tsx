// SSR scenarios for pills-input.test.tsx.
import { Pill } from '../pill';
import { PillsInput } from '.';

export const pillsInputs = () => (
  <div>
    <PillsInput label="Tags" description="Press Enter to add" class="mine">
      <Pill withRemoveButton>Design</Pill>
      <PillsInput.Field placeholder="Add a tag" />
    </PillsInput>
    <PillsInput label="Errored" error="Pick at least one" size="lg" variant="soft" leftSection={<span>#</span>}>
      <PillsInput.Field />
    </PillsInput>
    <PillsInput label="Disabled" disabled>
      <Pill withRemoveButton>Locked</Pill>
      <PillsInput.Field />
    </PillsInput>
  </div>
);
