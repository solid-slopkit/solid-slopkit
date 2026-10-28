import { createSignal } from 'solid-js';
import { Checkbox, Stack } from '@solid-slopkit/components';

export default function Basic() {
  const [accepted, setAccepted] = createSignal(false);

  return (
    <Stack gap={3}>
      <Checkbox
        label="I accept the terms"
        description="You can read them on the next page."
        checked={accepted()}
        onChange={setAccepted}
        error={accepted() ? undefined : 'You have to accept them to go on.'}
      />
      <Checkbox label="Send me the newsletter" defaultChecked color="success" />
      <Checkbox label="Not available" disabled />
    </Stack>
  );
}
