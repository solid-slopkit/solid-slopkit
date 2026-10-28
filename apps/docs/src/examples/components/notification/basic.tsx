import { Notification, Stack } from '@solid-slopkit/components';
import { Check, CircleAlert } from '@lucide/solid';

export default function Basic() {
  return (
    <Stack gap={3} style={{ width: '100%', 'max-width': '24rem' }}>
      <Notification title="Saved">Your changes are saved.</Notification>
      <Notification color="success" icon={<Check aria-hidden="true" />} title="Deployed">
        Version 0.0.1 is live.
      </Notification>
      <Notification color="error" icon={<CircleAlert aria-hidden="true" />} title="Deploy failed" role="alert">
        The build broke on step 3. See the log for details.
      </Notification>
    </Stack>
  );
}
