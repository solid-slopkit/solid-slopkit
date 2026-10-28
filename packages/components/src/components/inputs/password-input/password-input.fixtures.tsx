// SSR scenarios for password-input.test.tsx.
import { PasswordInput } from '.';

export const passwordInputs = () => (
  <div>
    <PasswordInput label="Password" class="mine" autocomplete="current-password" />
    <PasswordInput label="New password" description="At least 12 characters." defaultVisible size="lg" />
    <PasswordInput label="Locked" disabled value="secret" />
  </div>
);
