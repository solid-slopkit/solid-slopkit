import { createSignal } from 'solid-js';
import { Button } from '@solid-slopkit/components';
import { Bold } from '@lucide/solid';

export default function Active() {
  const [bold, setBold] = createSignal(false);

  return (
    <Button
      variant="ghost"
      shape="square"
      active={bold()}
      aria-label="Bold"
      aria-pressed={bold() ? 'true' : 'false'}
      onClick={() => setBold((value) => !value)}
    >
      <Bold />
    </Button>
  );
}
