import { createStore } from 'solid-js';
import { Stack, Text, TextInput } from '@solid-slopkit/components';
import { bind, error, form, required, validateAsync } from '@solid-slopkit/signal-forms';

const TAKEN = ['ada', 'grace', 'linus'];
const lookup = (name: string) => new Promise<boolean>((resolve) => setTimeout(() => resolve(TAKEN.includes(name)), 600));

export default function Async() {
  const [model, setModel] = createStore({ username: '' });
  const f = form(model, setModel, (p) => {
    required(p.username);
    validateAsync(p.username, async (ctx) => {
      const name = ctx.value();
      return name !== '' && (await lookup(name)) ? error('taken', `"${name}" is taken`) : null;
    });
  });

  return (
    <Stack gap={2} style={{ 'max-width': '20rem' }}>
      <TextInput label="Username" {...bind.text(f.username)} />
      <Text size="sm" aria-live="polite">
        {f.username.$pending() ? 'Checking…' : 'Try ada, grace or linus.'}
      </Text>
    </Stack>
  );
}
