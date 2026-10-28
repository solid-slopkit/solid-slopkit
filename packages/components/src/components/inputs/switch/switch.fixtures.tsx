// SSR scenarios for switch.test.tsx.
import { Switch } from '.';

export const switches = () => (
  <div>
    <Switch label="Wi-Fi" class="mine" />
    <Switch label="Bluetooth" description="Visible to nearby devices." defaultChecked color="success" size="lg" />
    <Switch label="Airplane mode" error="Not allowed by your admin." disabled />
    <Switch.Group label="Notifications" defaultValue={['email']}>
      <Switch value="email" label="Email" />
      <Switch value="sms" label="Text message" />
    </Switch.Group>
  </div>
);
