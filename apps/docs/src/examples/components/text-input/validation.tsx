import { createSignal } from 'solid-js';
import { Mail } from '@lucide/solid';
import { TextInput } from '@solid-slopkit/components';

export default function Validation() {
  const [email, setEmail] = createSignal('');
  const [touched, setTouched] = createSignal(false);
  // Shown once the field has been left, so the error doesn't appear while the address is still being typed.
  const error = () =>
    touched() && !/^\S+@\S+\.\S+$/.test(email()) ? 'Enter an email address, like name@example.com.' : undefined;

  return (
    <TextInput
      label="Email"
      type="email"
      autocomplete="email"
      description="We send the receipt here."
      required
      error={error()}
      leftSection={<Mail aria-hidden="true" />}
      value={email()}
      onInput={(event) => setEmail(event.currentTarget.value)}
      onBlur={() => setTouched(true)}
      style={{ width: '100%', 'max-width': '20rem' }}
    />
  );
}
