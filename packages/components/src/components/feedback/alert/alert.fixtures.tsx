// SSR scenarios for alert.test.tsx.
import { Alert } from '.';

const Icon = () => <svg aria-hidden="true" viewBox="0 0 24 24" />;

export const alerts = () => (
  <div>
    <Alert class="mine" title="Heads up" icon={<Icon />}>
      The default theme may still change.
    </Alert>
    <Alert color="error" variant="solid" title="Payment failed">
      <p>Your card was declined.</p>
    </Alert>
    <Alert color="success" variant="outline" role="status">
      Saved.
    </Alert>
    <Alert title="Closable" onClose={() => {}} closeButtonLabel="Dismiss">
      With a close button.
    </Alert>
  </div>
);
