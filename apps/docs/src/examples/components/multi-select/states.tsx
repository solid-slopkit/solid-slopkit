import { Tags } from '@lucide/solid';
import { MultiSelect, Stack } from '@solid-slopkit/components';

const topics = ['Design', 'Engineering', 'Marketing', 'Sales'];

export default function States() {
  return (
    <Stack style={{ width: '20rem' }}>
      <MultiSelect label="Topics" leftSection={<Tags />} variant="soft" data={topics} defaultValue={['Design']} />
      <MultiSelect label="Teams" size="sm" error="Pick at least one team" required data={topics} placeholder="Pick teams" />
      <MultiSelect label="Read only" readOnly data={topics} defaultValue={['Engineering', 'Sales']} />
      <MultiSelect label="Disabled" disabled data={topics} defaultValue={['Marketing']} />
    </Stack>
  );
}
