import { createSignal, For, onCleanup, Show } from 'solid-js';
import { ImageUp, Upload, X } from '@lucide/solid';
import { Dropzone, Group, List, Stack, Text, type DropzoneRejection } from '@solid-slopkit/components';

const MB = 1024 ** 2;

export default function Basic() {
  const [uploaded, setUploaded] = createSignal<File[]>([]);
  const [rejected, setRejected] = createSignal<DropzoneRejection[]>([]);
  const [uploading, setUploading] = createSignal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(timer));

  // Stands in for an upload.
  const upload = (files: File[]) => {
    setUploading(true);
    timer = setTimeout(() => {
      setUploaded((list) => [...list, ...files]);
      setUploading(false);
    }, 1200);
  };

  return (
    <Stack gap={3} style={{ width: '100%', 'max-width': '32rem' }}>
      <Dropzone
        accept="image/*"
        maxSize={5 * MB}
        loading={uploading()}
        loadingLabel="Uploading"
        onDrop={(files) => {
          setRejected([]);
          upload(files);
        }}
        onReject={setRejected}
      >
        <Group gap={4} wrap="nowrap" style={{ 'min-height': '6rem', 'justify-content': 'center' }}>
          <Dropzone.Idle>
            <ImageUp size={40} aria-hidden="true" />
          </Dropzone.Idle>
          <Dropzone.Accept>
            <Upload size={40} aria-hidden="true" style={{ color: 'var(--slp-color-primary)' }} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <X size={40} aria-hidden="true" style={{ color: 'var(--slp-color-error)' }} />
          </Dropzone.Reject>
          <div>
            <Text size="lg">
              <Dropzone.Idle>Drag images here or click to choose</Dropzone.Idle>
              <Dropzone.Accept>Release to upload</Dropzone.Accept>
              <Dropzone.Reject>Images only, please</Dropzone.Reject>
            </Text>
            <Text size="sm" dimmed>
              Each file up to 5 MB.
            </Text>
          </div>
        </Group>
      </Dropzone>
      <Show when={rejected().length > 0}>
        <Text size="sm" color="error">
          Skipped{' '}
          {rejected()
            .map((rejection) => `${rejection.file.name} (${rejection.errors.join(', ')})`)
            .join(', ')}
        </Text>
      </Show>
      <Show when={uploaded().length > 0}>
        <List size="sm">
          <For each={uploaded()}>{(file) => <List.Item>{file.name}</List.Item>}</For>
        </List>
      </Show>
    </Stack>
  );
}
