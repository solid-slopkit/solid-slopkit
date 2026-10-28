import { createSignal, For, Show } from 'solid-js';
import { FileButton, List, Stack, Text } from '@solid-slopkit/components';

export default function Multiple() {
  const [files, setFiles] = createSignal<File[]>([]);

  return (
    <Stack gap={2} align="flex-start">
      <FileButton
        multiple
        accept=".pdf,.txt,.md"
        variant="outline"
        onChange={(chosen) => setFiles((list) => [...list, ...chosen])}
      >
        Add documents
      </FileButton>
      <Show
        when={files().length > 0}
        fallback={
          <Text size="sm" dimmed>
            No documents yet.
          </Text>
        }
      >
        <List size="sm">
          <For each={files()}>{(file) => <List.Item>{file.name}</List.Item>}</For>
        </List>
      </Show>
    </Stack>
  );
}
