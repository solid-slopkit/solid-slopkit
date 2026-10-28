import { createSignal } from 'solid-js';
import { Text, TextInput } from '@solid-slopkit/components';

export default function Basic() {
  const [name, setName] = createSignal('');

  return (
    <div style={{ width: '100%', 'max-width': '20rem' }}>
      <TextInput label="Name" placeholder="Ada Lovelace" value={name()} onInput={(event) => setName(event.currentTarget.value)} />
      <Text size="sm" dimmed style={{ 'margin-top': '0.5rem' }}>
        Hello, {name() || 'stranger'}.
      </Text>
    </div>
  );
}
