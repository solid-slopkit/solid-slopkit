import { createSignal } from 'solid-js';
import { CopyButton, Group, Text } from '@solid-slopkit/components';

export default function Feedback() {
  const [message, setMessage] = createSignal('');

  return (
    <Group gap={2}>
      <CopyButton
        value="demo-key-not-a-real-secret"
        label="Copy API key"
        timeout={1000}
        onCopied={() => setMessage('API key copied.')}
        onCopyError={() => setMessage("Your browser didn't allow copying. Select the key and copy it by hand.")}
      />
      {/* A live region, so the message is announced when it changes. */}
      <Text as="span" size="sm" dimmed role="status">
        {message()}
      </Text>
    </Group>
  );
}
