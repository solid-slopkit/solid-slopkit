import { createStore } from 'solid-js';
import { Code, Stack, TextInput } from '@solid-slopkit/components';
import { bind, form, minLength, required } from '@solid-slopkit/signal-forms';

export default function FieldState() {
  const [model, setModel] = createStore({ username: '' });
  const f = form(model, setModel, (p) => {
    required(p.username);
    minLength(p.username, 3, 'At least 3 characters');
  });
  const state = () => ({
    $value: f.username.$value(),
    $touched: f.username.$touched(),
    $dirty: f.username.$dirty(),
    $valid: f.username.$valid(),
    $errors: f.username.$errors().map((e) => e.kind),
  });

  return (
    <Stack gap={2} style={{ 'max-width': '20rem' }}>
      <TextInput label="Username" {...bind.text(f.username)} />
      <Code block>{JSON.stringify(state(), null, 2)}</Code>
    </Stack>
  );
}
