import { createSignal } from 'solid-js';
import { Stack, TagsInput, Text } from '@solid-slopkit/components';

export default function Suggestions() {
  const [skills, setSkills] = createSignal<string[]>(['TypeScript']);
  const [duplicate, setDuplicate] = createSignal<string>();

  return (
    <Stack style={{ width: '20rem' }}>
      <TagsInput
        label="Skills"
        description="Up to five; pick a suggestion or type your own"
        placeholder="Add a skill"
        maxTags={5}
        clearable
        value={skills()}
        onChange={(value) => {
          setSkills(value);
          setDuplicate(undefined);
        }}
        onDuplicate={setDuplicate}
        data={[
          { group: 'Frontend', items: ['CSS', 'HTML', 'TypeScript', 'Accessibility'] },
          { group: 'Backend', items: ['Go', 'Rust', 'SQL', { value: 'COBOL', disabled: true }] },
        ]}
      />
      <Text size="sm">{duplicate() ? `${duplicate()} is already there` : `Value: ${skills().join(', ') || 'none'}`}</Text>
    </Stack>
  );
}
