import { createSignal, onCleanup } from 'solid-js';
import { Button, Tooltip } from '@solid-slopkit/components';

export default function Controlled() {
  const [opened, setOpened] = createSignal(false);
  const [copied, setCopied] = createSignal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(timer));

  const copy = () => {
    setCopied(true);
    setOpened(true);
    clearTimeout(timer);
    timer = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Tooltip label={copied() ? 'Copied' : 'Copy the invite code'} opened={opened()} onChange={setOpened} withArrow>
      {(target) => (
        <Button {...target} variant="outline" onClick={copy}>
          Invite code
        </Button>
      )}
    </Tooltip>
  );
}
