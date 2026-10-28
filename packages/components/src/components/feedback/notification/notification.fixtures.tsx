// SSR scenarios for notification.test.tsx.
import { Notification } from '.';

const Icon = () => <svg aria-hidden="true" viewBox="0 0 24 24" />;

export const notifications = () => (
  <div>
    <Notification class="mine" title="Saved">
      Your changes are saved.
    </Notification>
    <Notification color="success" icon={<Icon />} title="Deployed">
      Version 0.0.1 is live.
    </Notification>
    <Notification loading title="Uploading">
      3 of 5 files
    </Notification>
    <Notification icon={<Icon />} title="Closable" onClose={() => {}} closeButtonLabel="Dismiss">
      With a close button.
    </Notification>
    {/* An icon that isn't shown while loading must not be created: hydration would look for it in the page. */}
    <Notification loading icon={<Icon />} title="Saving">
      Almost done
    </Notification>
  </div>
);
