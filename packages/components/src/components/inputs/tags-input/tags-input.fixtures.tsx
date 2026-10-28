// SSR scenarios for tags-input.test.tsx.
import { TagsInput } from '.';

export const tagsInputs = () => (
  <div>
    <TagsInput label="Tags" placeholder="Add a tag" class="mine" />
    <TagsInput label="Topics" name="topics" defaultValue={['solid', 'css']} clearable data={['solid', 'svelte']} />
    <TagsInput label="Read only" readOnly defaultValue={['a']} error="Required" />
    <TagsInput label="Disabled" disabled defaultValue={['b']} />
  </div>
);
