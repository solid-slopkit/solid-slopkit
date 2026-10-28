// SSR scenarios for close-button.test.tsx.
import { CloseButton } from '.';

export const closeButtons = () => (
  <div>
    <CloseButton class="mine" />
    <CloseButton size="xs" color="error" label="Dismiss" />
    <CloseButton disabled />
    <CloseButton label="Remove">
      <svg aria-hidden="true" viewBox="0 0 24 24" />
    </CloseButton>
  </div>
);
