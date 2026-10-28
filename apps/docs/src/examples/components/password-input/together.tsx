import { createSignal } from 'solid-js';
import { PasswordInput, Stack } from '@solid-slopkit/components';

// One visibility for both fields: either toggle shows or hides them together.
export default function Together() {
  const [visible, setVisible] = createSignal(false);

  return (
    <Stack gap={3} style={{ width: '100%', 'max-width': '20rem' }}>
      <PasswordInput
        label="New password"
        description="At least 12 characters."
        autocomplete="new-password"
        visible={visible()}
        onVisibilityChange={setVisible}
      />
      <PasswordInput label="Repeat it" autocomplete="new-password" visible={visible()} onVisibilityChange={setVisible} />
    </Stack>
  );
}
