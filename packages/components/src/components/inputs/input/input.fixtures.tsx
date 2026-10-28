// SSR scenarios for input.test.tsx.
import { Input } from '.';
import { InputWrapper } from '../input-wrapper';

const Icon = () => <svg aria-hidden="true" viewBox="0 0 24 24" />;

export const inputs = () => (
  <div>
    <Input aria-label="Name" class="mine" placeholder="Your name" />
    <Input aria-label="Search" variant="soft" size="lg" leftSection={<Icon />} rightSection={<span>⌘K</span>} />
    <Input aria-label="Locked" disabled value="fixed" />
    <Input as="textarea" aria-label="Notes" rows={3} />
  </div>
);

export const wrapped = () => (
  <div>
    <InputWrapper label="Email" description="We never share it." error="Enter a valid email." required>
      <Input type="email" />
    </InputWrapper>
    <InputWrapper label="Plain" size="sm">
      <Input variant="ghost" />
    </InputWrapper>
  </div>
);
