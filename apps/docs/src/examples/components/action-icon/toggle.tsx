import { createSignal } from 'solid-js';
import { Bold, Italic } from '@lucide/solid';
import { ActionIcon, Group } from '@solid-slopkit/components';

export default function Toggle() {
  const [bold, setBold] = createSignal(false);
  const [italic, setItalic] = createSignal(true);

  return (
    <Group gap={1}>
      <ActionIcon label="Bold" active={bold()} aria-pressed={bold() ? 'true' : 'false'} onClick={() => setBold((on) => !on)}>
        <Bold aria-hidden="true" />
      </ActionIcon>
      <ActionIcon
        label="Italic"
        active={italic()}
        aria-pressed={italic() ? 'true' : 'false'}
        onClick={() => setItalic((on) => !on)}
      >
        <Italic aria-hidden="true" />
      </ActionIcon>
    </Group>
  );
}
