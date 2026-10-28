import { createSignal, createStore } from 'solid-js';
import { Button, Stack, Text, TextInput } from '@solid-slopkit/components';
import { bind, form, required, submit } from '@solid-slopkit/signal-forms';

const save = (value: { title: string }) =>
  new Promise<string>((resolve) => setTimeout(() => resolve(`Saved "${value.title}"`), 800));

export default function Submit() {
  const [model, setModel] = createStore({ title: '' });
  const f = form(model, setModel, (p) => required(p.title, 'Enter a title'));
  const [result, setResult] = createSignal<string>();

  return (
    <form
      novalidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit(f, async (value) => setResult(await save(value)));
      }}
    >
      <Stack gap={2} style={{ 'max-width': '20rem' }}>
        <TextInput label="Title" {...bind.text(f.title)} />
        <Button type="submit" variant="outline" loading={f.$submitting()}>
          Save
        </Button>
        <Text size="sm">{result() ?? 'Not saved yet.'}</Text>
      </Stack>
    </form>
  );
}
