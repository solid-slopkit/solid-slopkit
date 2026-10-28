import { createSignal } from 'solid-js';
import { Stack, Switch, Text } from '@solid-slopkit/components';

export default function Group() {
  const [channels, setChannels] = createSignal<string[]>(['email']);

  return (
    <div>
      <Switch.Group
        label="Notifications"
        description="Where we tell you about new replies."
        value={channels()}
        onChange={setChannels}
      >
        <Stack gap={2} style={{ 'margin-top': '0.25rem' }}>
          <Switch value="email" label="Email" />
          <Switch value="push" label="Push" />
          <Switch value="sms" label="Text message" />
        </Stack>
      </Switch.Group>
      <Text size="sm" dimmed style={{ 'margin-top': '0.5rem' }}>
        Value: [{channels().join(', ')}]
      </Text>
    </div>
  );
}
