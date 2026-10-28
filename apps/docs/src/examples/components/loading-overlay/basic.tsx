import { createSignal, onCleanup } from 'solid-js';
import { Button, Group, LoadingOverlay, Paper, Stack, TextInput } from '@solid-slopkit/components';

export default function Basic() {
  const [saving, setSaving] = createSignal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(timer));

  const save = () => {
    setSaving(true);
    timer = setTimeout(() => setSaving(false), 2000);
  };

  return (
    <Paper withBorder style={{ position: 'relative' }}>
      <Stack inert={saving()}>
        <TextInput label="Project name" value="Analytical engine" />
        <Group justify="flex-end">
          <Button onClick={save}>Save</Button>
        </Group>
      </Stack>
      <LoadingOverlay visible={saving()} label="Saving the project" />
    </Paper>
  );
}
