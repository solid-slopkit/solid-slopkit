import { createSignal } from 'solid-js';
import { Upload } from '@lucide/solid';
import { FileButton, Group, Text } from '@solid-slopkit/components';

export default function Basic() {
  const [file, setFile] = createSignal<File>();

  return (
    <Group gap={3}>
      <FileButton accept="image/png,image/jpeg" leftSection={<Upload aria-hidden="true" />} onChange={setFile}>
        Upload a photo
      </FileButton>
      <Text as="span" size="sm" dimmed>
        {file()?.name ?? 'No photo chosen'}
      </Text>
    </Group>
  );
}
