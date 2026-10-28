import { createSignal, createStore } from 'solid-js';
import { Button, Stack, Text, TextInput } from '@solid-slopkit/components';
import { bind, email, form, required, submit } from '@solid-slopkit/signal-forms';

export default function Usage() {
  const [model, setModel] = createStore({ name: '', email: '' });
  const f = form(model, setModel, (p) => {
    required(p.name, 'Enter your name');
    required(p.email, 'Enter your email');
    email(p.email);
  });
  const [sent, setSent] = createSignal<string>();

  return (
    <form
      novalidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit(f, (value) => setSent(JSON.stringify(value)));
      }}
    >
      <Stack gap={2} style={{ 'max-width': '20rem' }}>
        <TextInput label="Name" {...bind.text(f.name)} />
        <TextInput label="Email" {...bind.text(f.email)} />
        <Button type="submit" variant="outline">
          Sign up
        </Button>
        <Text size="sm">{sent() ?? 'Nothing submitted yet.'}</Text>
      </Stack>
    </form>
  );
}
