import { createSignal } from 'solid-js';
import { Text, Textarea } from '@solid-slopkit/components';

export default function Autosize() {
  const [message, setMessage] = createSignal('');

  return (
    <div style={{ width: '100%', 'max-width': '24rem' }}>
      <Textarea
        label="Message"
        description="Grows from two to six lines, then scrolls."
        autosize
        minRows={2}
        maxRows={6}
        value={message()}
        onInput={(event) => setMessage(event.currentTarget.value)}
      />
      <Text size="xs" dimmed style={{ 'margin-top': '0.25rem' }}>
        {message().length} characters
      </Text>
    </div>
  );
}
