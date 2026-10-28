import { createSignal, Show } from 'solid-js';
import { Button, Dropzone, Stack, Text } from '@solid-slopkit/components';

export default function Browse() {
  const [file, setFile] = createSignal<File | null>(null);
  let open: (() => void) | undefined;

  return (
    <Dropzone
      openOnClick={false}
      openRef={(fn) => (open = fn)}
      multiple={false}
      accept=".csv"
      onDrop={(files) => setFile(files[0])}
      style={{ width: '100%', 'max-width': '32rem' }}
    >
      <Stack gap={2} align="center">
        <Text>
          <Dropzone.Idle>Drop a CSV file here</Dropzone.Idle>
          <Dropzone.Accept>Release to import</Dropzone.Accept>
          <Dropzone.Reject>One file at a time</Dropzone.Reject>
        </Text>
        <Button variant="outline" size="sm" onClick={() => open?.()}>
          Browse files
        </Button>
        <Show when={file()}>
          {(chosen) => (
            <Text size="sm" dimmed>
              {chosen().name}
            </Text>
          )}
        </Show>
      </Stack>
    </Dropzone>
  );
}
