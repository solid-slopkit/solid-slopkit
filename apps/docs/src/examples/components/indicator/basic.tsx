import { createSignal } from 'solid-js';
import { Button, Indicator } from '@solid-slopkit/components';
import { Inbox } from '@lucide/solid';

export default function Basic() {
  const [unread, setUnread] = createSignal(3);

  return (
    <>
      <Indicator label={unread()} color="error" disabled={unread() === 0}>
        <Button aria-label={`Inbox, ${unread()} unread`} leftSection={<Inbox aria-hidden="true" />}>
          Inbox
        </Button>
      </Indicator>
      <Button variant="ghost" onClick={() => setUnread((count) => count + 1)}>
        Add one
      </Button>
      <Button variant="ghost" onClick={() => setUnread(0)}>
        Mark all read
      </Button>
    </>
  );
}
