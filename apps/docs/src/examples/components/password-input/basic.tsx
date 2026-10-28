import { PasswordInput } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <PasswordInput
      label="Password"
      autocomplete="current-password"
      placeholder="Your password"
      style={{ width: '100%', 'max-width': '20rem' }}
    />
  );
}
