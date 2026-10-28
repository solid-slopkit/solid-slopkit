import { createSignal, onCleanup, onSettled } from 'solid-js';
import { Button, Notification, Stack } from '@solid-slopkit/components';
import { Check } from '@lucide/solid';

export default function Loading() {
  const [done, setDone] = createSignal(0);
  let timer: ReturnType<typeof setInterval> | undefined;
  onCleanup(() => clearInterval(timer));

  const start = () => {
    clearInterval(timer);
    setDone(0);
    timer = setInterval(() => {
      setDone((count) => {
        if (count + 1 >= 5) clearInterval(timer);
        return Math.min(count + 1, 5);
      });
    }, 700);
  };

  onSettled(start);

  return (
    <Stack gap={3} style={{ width: '100%', 'max-width': '24rem' }}>
      <Notification
        loading={done() < 5}
        color={done() < 5 ? 'primary' : 'success'}
        icon={<Check aria-hidden="true" />}
        title={done() < 5 ? 'Uploading' : 'Uploaded'}
      >
        {done()} of 5 files
      </Notification>
      <Button size="sm" variant="outline" style={{ 'align-self': 'flex-start' }} onClick={start}>
        Upload again
      </Button>
    </Stack>
  );
}
