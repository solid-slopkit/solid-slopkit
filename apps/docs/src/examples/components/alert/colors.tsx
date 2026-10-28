import { Alert, Stack } from '@solid-slopkit/components';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from '@lucide/solid';

export default function Colors() {
  return (
    <Stack gap={3} style={{ width: '100%' }}>
      <Alert color="info" icon={<Info aria-hidden="true" />} title="New version" role="note">
        Version 0.0.2 is out.
      </Alert>
      <Alert color="success" icon={<CircleCheck aria-hidden="true" />} title="Saved" role="status">
        Your changes are saved.
      </Alert>
      <Alert color="warning" icon={<TriangleAlert aria-hidden="true" />} title="Almost full">
        You've used 90% of your storage.
      </Alert>
      <Alert color="error" icon={<CircleAlert aria-hidden="true" />} title="Payment failed">
        Your card was declined. Try another card or contact your bank.
      </Alert>
    </Stack>
  );
}
