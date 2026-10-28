import { Hash } from '@lucide/solid';
import { Pill, PillsInput, Stack } from '@solid-slopkit/components';

export default function Variants() {
  return (
    <Stack style={{ width: '22rem' }}>
      <PillsInput label="Soft, small" variant="soft" size="sm">
        <Pill>design</Pill>
        <PillsInput.Field placeholder="Add a tag" />
      </PillsInput>
      <PillsInput label="With a section and an error" leftSection={<Hash />} error="Pick at most three tags" required>
        <Pill withRemoveButton color="error">
          one
        </Pill>
        <Pill withRemoveButton>two</Pill>
        <Pill withRemoveButton>three</Pill>
        <Pill withRemoveButton>four</Pill>
        <PillsInput.Field />
      </PillsInput>
      <PillsInput label="Disabled" disabled>
        <Pill withRemoveButton>locked</Pill>
        <PillsInput.Field placeholder="Can't add" />
      </PillsInput>
    </Stack>
  );
}
