// SSR scenarios for text-input.test.tsx.
import { TextInput } from '.';

const Icon = () => <svg aria-hidden="true" viewBox="0 0 24 24" />;

export const textInputs = () => (
  <div>
    <TextInput label="Name" placeholder="Your name" class="mine" />
    <TextInput label="Email" description="We never share it." error="Enter a valid email." required type="email" />
    <TextInput label="Search" variant="soft" size="lg" leftSection={<Icon />} />
    <TextInput label="Locked" disabled value="fixed" />
    <TextInput aria-label="No label" />
  </div>
);
