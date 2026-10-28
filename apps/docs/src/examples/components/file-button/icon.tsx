import { createSignal } from 'solid-js';
import { Paperclip } from '@lucide/solid';
import { FileButton, Group, Text } from '@solid-slopkit/components';

export default function Icon() {
  const [file, setFile] = createSignal<File>();

  return (
    <Group gap={2}>
      <FileButton variant="ghost" shape="square" aria-label="Attach a file" onChange={setFile}>
        <Paperclip aria-hidden="true" />
      </FileButton>
      <Text as="span" size="sm" dimmed>
        {file()?.name ?? 'Nothing attached'}
      </Text>
    </Group>
  );
}
