import { createSignal, For } from 'solid-js';
import { Pill, PillsInput } from '@solid-slopkit/components';

export default function Basic() {
  const [tags, setTags] = createSignal(['design', 'research']);
  const [draft, setDraft] = createSignal('');

  const add = () => {
    const tag = draft().trim();
    if (tag && !tags().includes(tag)) setTags((list) => [...list, tag]);
    setDraft('');
  };

  return (
    <PillsInput
      label="Tags"
      description="Enter adds a tag, Backspace in the empty field removes the last one"
      style={{ width: '22rem' }}
    >
      <For each={tags()}>
        {(tag) => (
          <Pill withRemoveButton onRemove={() => setTags((list) => list.filter((other) => other !== tag))}>
            {tag}
          </Pill>
        )}
      </For>
      <PillsInput.Field
        placeholder="Add a tag"
        value={draft()}
        onInput={(event) => setDraft(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            add();
          } else if (event.key === 'Backspace' && draft() === '') {
            setTags((list) => list.slice(0, -1));
          }
        }}
      />
    </PillsInput>
  );
}
