import { createSignal } from 'solid-js';
import { Input, InputWrapper } from '@solid-slopkit/components';

export default function Basic() {
  const [email, setEmail] = createSignal('');
  const error = () => (email() && !email().includes('@') ? 'Enter an email address, like name@example.com.' : undefined);

  return (
    <InputWrapper
      label="Email"
      description="We send the receipt here."
      error={error()}
      required
      style={{ width: '100%', 'max-width': '20rem' }}
    >
      <Input
        type="email"
        placeholder="name@example.com"
        value={email()}
        onInput={(event) => setEmail(event.currentTarget.value)}
      />
    </InputWrapper>
  );
}
