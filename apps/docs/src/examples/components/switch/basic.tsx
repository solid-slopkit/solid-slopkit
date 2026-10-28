import { createSignal } from 'solid-js';
import { Stack, Switch } from '@solid-slopkit/components';

export default function Basic() {
  const [wifi, setWifi] = createSignal(true);

  return (
    <Stack gap={3}>
      <Switch label="Wi-Fi" description={wifi() ? 'Connected to Home.' : 'Off.'} checked={wifi()} onChange={setWifi} />
      <Switch label="Bluetooth" color="success" />
      <Switch label="Airplane mode" description="Managed by your organization." disabled />
    </Stack>
  );
}
