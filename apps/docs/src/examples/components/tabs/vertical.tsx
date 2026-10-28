import { Tabs, Text } from '@solid-slopkit/components';

export default function Vertical() {
  return (
    <Tabs defaultValue="account" orientation="vertical" activation="manual" size="sm">
      <Tabs.List aria-label="Settings">
        <Tabs.Tab value="account">Account</Tabs.Tab>
        <Tabs.Tab value="notifications">Notifications</Tabs.Tab>
        <Tabs.Tab value="billing">Billing</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="account" style={{ 'padding-inline': '1rem' }}>
        <Text>Your name, email and password.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="notifications" style={{ 'padding-inline': '1rem' }}>
        <Text>What we email you about, and how often.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="billing" style={{ 'padding-inline': '1rem' }}>
        <Text>Your plan, invoices and payment method.</Text>
      </Tabs.Panel>
    </Tabs>
  );
}
