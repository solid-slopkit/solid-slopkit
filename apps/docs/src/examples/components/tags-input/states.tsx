import { Hash } from '@lucide/solid';
import { Stack, TagsInput } from '@solid-slopkit/components';

export default function States() {
  return (
    <Stack style={{ width: '20rem' }}>
      <TagsInput label="Hashtags" leftSection={<Hash />} variant="soft" splitChars={[',', ' ']} defaultValue={['solid']} />
      <TagsInput label="Keywords" size="sm" error="Add at least one keyword" required placeholder="Add keywords" />
      <TagsInput label="Read only" readOnly defaultValue={['alpha', 'beta']} />
      <TagsInput label="Disabled" disabled defaultValue={['gamma']} />
    </Stack>
  );
}
