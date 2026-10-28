// SSR scenarios for action-icon.test.tsx.
import { ActionIcon } from '.';

const Icon = () => <svg aria-hidden="true" viewBox="0 0 24 24" />;

export const actionIcons = () => (
  <div>
    <ActionIcon label="Edit" class="mine">
      <Icon />
    </ActionIcon>
    <ActionIcon label="Delete" variant="solid" color="error" shape="circle" size="lg">
      <Icon />
    </ActionIcon>
    <ActionIcon label="Bold" active aria-pressed="true">
      <Icon />
    </ActionIcon>
    <ActionIcon label="Saving" loading>
      <Icon />
    </ActionIcon>
    <ActionIcon label="Locked" disabled>
      <Icon />
    </ActionIcon>
    <ActionIcon as="a" href="/settings" label="Settings">
      <Icon />
    </ActionIcon>
  </div>
);
