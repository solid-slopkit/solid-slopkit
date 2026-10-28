import { TagsInput } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <TagsInput
      label="Tags"
      description="Press Enter or type a comma to add a tag"
      placeholder="Add a tag"
      defaultValue={['design', 'research']}
      style={{ width: '20rem' }}
    />
  );
}
