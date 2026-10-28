import { createSignal, Show } from 'solid-js';
import { Alert, Button } from '@solid-slopkit/components';

export default function Dismiss() {
  const [open, setOpen] = createSignal(true);

  return (
    <Show
      when={open()}
      fallback={
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          Show the alert again
        </Button>
      }
    >
      <Alert color="warning" title="Unsaved changes" style={{ width: '100%' }} onClose={() => setOpen(false)}>
        You have changes that aren't saved yet.
      </Alert>
    </Show>
  );
}
