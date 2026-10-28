import { createStore } from 'solid-js';
import { PasswordInput, Stack, TextInput } from '@solid-slopkit/components';
import { bind, email, error, form, maxLength, minLength, pattern, required, validate } from '@solid-slopkit/signal-forms';

export default function Validation() {
  const [model, setModel] = createStore({ username: '', email: '', password: '', confirm: '' });
  const f = form(model, setModel, (p) => {
    required(p.username);
    minLength(p.username, 3);
    maxLength(p.username, 12);
    pattern(p.username, /^[a-z0-9_]*$/, 'Lowercase letters, digits and _ only');

    required(p.email);
    email(p.email);

    validate(p.password, (ctx) => (/\d/.test(ctx.value()) ? null : error('digit', 'Add at least one digit')));
    validate(p.confirm, (ctx) => (ctx.value() === ctx.valueOf(p.password) ? null : error('match', 'Passwords do not match')));
  });

  return (
    <Stack gap={2} style={{ 'max-width': '20rem' }}>
      <TextInput label="Username" {...bind.text(f.username)} />
      <TextInput label="Email" {...bind.text(f.email)} />
      <PasswordInput label="Password" {...bind.text(f.password)} />
      <PasswordInput label="Confirm password" {...bind.text(f.confirm)} />
    </Stack>
  );
}
